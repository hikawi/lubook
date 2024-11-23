import { compareSync, hashSync } from "bcryptjs";
import mongoose from "mongoose";
import supertest from "supertest";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import app from "../../app";
import { connectMongo, disconnectMongo } from "../../db";
import { User } from "../../models/user.model";

describe("user controller", async () => {
  beforeAll(async () => {
    await connectMongo();
  });

  afterEach(async () => {
    await mongoose.connection.dropDatabase();
  });

  afterAll(async () => {
    await disconnectMongo();
  });

  it("should reject register if malformed body", async () => {
    const res = await supertest(app).post("/register").send({ username: "a", email: "bademail@email", password: "pw" });
    expect(res.statusCode).toBe(400);
  });

  it("should reject register if user exists", async () => {
    await User.create({ username: "username", email: "abc@example.com", password: hashSync("1234") });
    const res = await supertest(app)
      .post("/register")
      .send({ name: "name", username: "username", email: "a@example.com", password: "1234" });
    expect(res.statusCode).toBe(409);
  });

  it("should create user correctly", async () => {
    const data = { name: "luna", username: "luna", email: "luna@example.com", password: "12345" };
    const res = await supertest(app).post("/register").send(data);

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("name", data.name);
    expect(res.body).toHaveProperty("username", data.username);
    expect(res.body).toHaveProperty("email", data.email);
    expect(compareSync(data.password, res.body.password)).toBeTruthy();
  });

  it("should reject login if malformed data", async () => {
    const res = await supertest(app).post("/login").send({ profile: "a", password: "12345" });
    expect(res.statusCode).toBe(400);
  });

  it("should reject login 404 if account not found", async () => {
    const res = await supertest(app).post("/login").send({ profile: "luna@example.com", password: "12345" });
    expect(res.statusCode).toBe(404);
  });

  it("should reject login 401 if password doesn't match", async () => {
    await User.create({ username: "luna", email: "luna@example.com", password: hashSync("1234", 10) });
    const res = await supertest(app).post("/login").send({ profile: "luna@example.com", password: "12345" });
    expect(res.statusCode).toBe(401);
  });

  it("can sign in with email", async () => {
    const data = { name: "luna", username: "luna", email: "luna@example.com", password: "12345" };
    await User.create({ username: data.username, email: data.email, password: hashSync(data.password, 10) });

    const res = await supertest(app).post("/login").send({ profile: "luna@example.com", password: "12345" });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("token");
  });
});
