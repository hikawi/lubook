import { hashSync } from "bcryptjs";
import supertest from "supertest";
import { afterAll, afterEach, describe, expect, it, vi } from "vitest";
import app from "../app";
import { db, disconnect } from "../db";
import { users } from "../db/schema/user";
import { emailTransport } from "../misc/email-sender";
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

    const sendMailMock = vi.fn();
    vi.spyOn(emailTransport, "sendMail").mockImplementationOnce(sendMailMock);

    expect(res.statusCode).toBe(201);
    await expect(db.$count(users)).resolves.toBe(1);
    expect(sendMailMock).toHaveBeenCalled();
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

  it("should accept login if credentials correct", async () => {
    await db
      .insert(users)
      .values({
        username: "luna",
        password: hashSync("1234", 12),
        email: "luna@example.com",
        role: "user",
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
