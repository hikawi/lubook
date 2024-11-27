import { hashSync } from "bcryptjs";
import supertest from "supertest";
import { afterAll, afterEach, describe, expect, it } from "vitest";
import app from "../app";
import { db, disconnect } from "../db";
import { users } from "../db/schema/user";
import { clearDatabase } from "./utils";

describe("users", () => {
  afterEach(async () => {
    await clearDatabase();
    expect(await db.$count(users)).toBe(0);
  });

  afterAll(async () => {
    await disconnect();
  });

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
      email: "luna@example.com",
      password: hashSync("1234", 12),
      role: "user",
    });

    const res = await supertest(app).post("/register").send({
      username: "luna",
      email: "luna@example.co",
      password: "1234",
    });
    expect(res.statusCode).toBe(409);
  });

  it("should succeed register if everything correct", async () => {
    const res = await supertest(app).post("/register").send({
      username: "luna",
      email: "luna@example.co",
      password: "1234",
    });

    expect(res.statusCode).toBe(201);
    await expect(db.$count(users)).resolves.toBe(1);
  });

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
      email: "luna@example.com",
      password: hashSync("1234", 12),
      role: "user",
    });

    const res = await supertest(app).post("/login").send({
      profile: "luna",
      password: "12345",
    });
    expect(res.statusCode).toBe(401);
  });

  it("should accept login if credentials correct", async () => {
    await db.insert(users).values({
      username: "luna",
      email: "luna@example.com",
      password: hashSync("1234", 12),
      role: "user",
    });

    const res = await supertest(app).post("/login").send({
      profile: "luna",
      password: "1234",
    });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("token");
  });
});
