import { hashSync } from "bcryptjs";
import { eq } from "drizzle-orm";
import supertest from "supertest";
import {
  afterAll,
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import app from "../app";
import { db, disconnect } from "../db";
import { users } from "../db/schema";
import { clearDatabase } from "./utils";

afterEach(async () => {
  await clearDatabase();
  expect(await db.$count(users)).toBe(0);
});

afterAll(async () => {
  await disconnect();
});

describe("registration", () => {
  it("should fail register if bad input", async () => {
    const res = await supertest(app).post("/register").send({
      name: "luna",
      username: "luna@$",
      email: "luna@example",
      password: "1234",
    });
    expect(res.statusCode).toBe(400);
  });

  it("should fail register if already did", async () => {
    await db.insert(users).values({
      username: "luna",
      password: hashSync("1234", 12),
      email: "luna@example.com",
      role: "user",
    });

    const res = await supertest(app).post("/register").send({
      username: "luna",
      email: "luna@example.com",
      password: "1234",
    });
    expect(res.statusCode).toBe(409);
  });

  it("should succeed register if everything correct", async () => {
    const res = await supertest(app).post("/register").send({
      username: "luna",
      email: "luna@example.com",
      password: "1234",
    });

    expect(res.statusCode).toBe(201);
    await expect(db.$count(users)).resolves.toBe(1);
  });
});

describe("logging in", () => {
  it("should deny login if bad request", async () => {
    const res = await supertest(app).post("/login").send({
      profile: "@@@$$$",
      password: "1234",
    });
    expect(res.statusCode).toBe(400);
  });

  it("should deny login if account doesn't exist", async () => {
    const res = await supertest(app).post("/login").send({
      profile: "luna",
      password: "1234",
    });
    expect(res.statusCode).toBe(404);
  });

  it("should deny login if passwords don't match", async () => {
    await db.insert(users).values({
      username: "luna",
      password: hashSync("1234", 12),
      email: "luna@example.com",
      role: "user",
    });

    const res = await supertest(app).post("/login").send({
      profile: "luna",
      password: "12345",
    });
    expect(res.statusCode).toBe(401);
  });

  it("should deny login if not verified", async () => {
    await db.insert(users).values({
      username: "luna",
      password: hashSync("1234", 12),
      email: "luna@example.com",
      role: "user",
    });

    const res = await supertest(app).post("/login").send({
      profile: "luna",
      password: "1234",
    });
    expect(res.statusCode).toBe(403);
  });

  it("should accept login if credentials correct", async () => {
    await db
      .insert(users)
      .values({
        username: "luna",
        password: hashSync("1234", 12),
        email: "luna@example.com",
        role: "user",
        verified: true,
      })
      .returning();

    const res = await supertest(app).post("/login").send({
      profile: "luna",
      password: "1234",
    });
    expect(res.statusCode).toBe(200);
    expect(res.headers["set-cookie"]).toBeDefined();
    expect(res.headers["set-cookie"][0]).toMatch(/^authorization=/);
  });
});

describe("logging out", () => {
  it("should deny auth after token expired", async () => {
    vi.useFakeTimers();

    await db.insert(users).values({
      username: "luna",
      password: hashSync("1234", 12),
      email: "luna@example.com",
      role: "user",
      verified: true,
    });

    const res = await supertest(app).post("/login").send({
      profile: "luna",
      password: "1234",
    });
    const token = res.headers["set-cookie"][0];
    expect(res.statusCode).toBe(200);
    expect(token).toBeDefined();

    vi.setSystemTime(new Date().getTime() + 7 * 24 * 60 * 61 * 1000);
    const res2 = await supertest(app).head("/auth").set("Cookie", token).send();
    expect(res2.statusCode).toBe(401);

    vi.useRealTimers();
  });

  it("invalidates auth cookie on logout", async () => {
    await db.insert(users).values({
      username: "luna",
      password: hashSync("1234", 12),
      email: "luna@example.com",
      role: "user",
      verified: true,
    });

    // Login and retrieve first token.
    const res = await supertest(app).post("/login").send({
      profile: "luna",
      password: "1234",
    });
    const token = res.headers["set-cookie"][0];
    expect(res.statusCode).toBe(200);
    expect(token).toBeDefined();

    // Invalidates such token. Retrieves new cookie
    const res2 = await supertest(app)
      .post("/logout")
      .set("Cookie", token)
      .send();
    expect(res2.statusCode).toBe(204);
    const newCookie = res2.headers["set-cookie"][0];

    // Check if authenticated?
    const res3 = await supertest(app)
      .head("/auth")
      .set("Cookie", newCookie)
      .send();
    expect(res3.statusCode).toBe(401);
  });
});

describe("updating account", () => {
  let token: string;

  beforeEach(async () => {
    await db.insert(users).values([
      {
        username: "luna",
        email: "luna@example.com",
        password: hashSync("1234", 12),
        role: "user",
        verified: true,
      },
      {
        username: "louie",
        email: "louie@example.com",
        password: hashSync("1234", 12),
        role: "user",
        verified: true,
      },
    ]);

    // Login and retrieve first token.
    const res = await supertest(app).post("/login").send({
      profile: "luna",
      password: "1234",
    });
    token = res.headers["set-cookie"][0];
    expect(res.statusCode).toBe(200);
    expect(token).toBeDefined();
  });

  it("should reject update without auth", async () => {
    const res = await supertest(app).post("/users").send({});
    expect(res.statusCode).toBe(401);
  });

  it("should return 400 if invalid body", async () => {
    const res = await supertest(app)
      .post("/users")
      .set("Cookie", token)
      .send({ username: "a" });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("message");
    expect(res.body).toHaveProperty("path");
  });

  it("should return 409 if conflict username", async () => {
    const res = await supertest(app)
      .post("/users")
      .set("Cookie", token)
      .send({ username: "louie", email: "luna@example.com", password: "1234" });
    expect(res.statusCode).toBe(409);
    expect(res.body).toHaveProperty("message");
    expect(res.body).toHaveProperty("path", "username");
  });

  it("should return 409 if conflict email", async () => {
    const res = await supertest(app)
      .post("/users")
      .set("Cookie", token)
      .send({ username: "LUNA", email: "louie@example.com", password: "1234" });
    expect(res.statusCode).toBe(409);
    expect(res.body).toHaveProperty("message");
    expect(res.body).toHaveProperty("path", "email");
  });

  it("should return 403 if wrong password", async () => {
    const res = await supertest(app)
      .post("/users")
      .set("Cookie", token)
      .send({ username: "LUNA", email: "luna@example.com", password: "12345" });
    expect(res.statusCode).toBe(403);
  });

  it("should return 200 if correct", async () => {
    const res = await supertest(app)
      .post("/users")
      .set("Cookie", token)
      .send({ username: "LUNA", email: "luna@example.com", password: "1234" });
    expect(res.statusCode).toBe(200);

    const user = await db
      .select()
      .from(users)
      .where(eq(users.username, "LUNA"));
    expect(user).toHaveLength(1);
  });
});
