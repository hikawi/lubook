import supertest from "supertest";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import app from "../app";
import { db } from "../db";
import { blockUser } from "../db/queries/block.query";
import { findUser } from "../db/queries/user.query";
import { blockUsers } from "../db/schema";
import { clearDatabase, setupTestUsers } from "./utils";

describe("blocks", () => {
  let token: string = "";

  beforeAll(async () => {
    await setupTestUsers();
    const loginRes = await supertest(app)
      .post("/login")
      .send({ profile: "blueberry", password: "blueberry" });

    expect(loginRes.statusCode).toBe(200);
    token = loginRes.headers["set-cookie"];
  });

  afterEach(async () => {
    await db.delete(blockUsers);
  });

  afterAll(async () => {
    await clearDatabase();
  });

  async function getUser(username: string) {
    return (await findUser({ username }))![0];
  }

  it("should throw 400 if bad blocklist", async () => {
    const res = await supertest(app)
      .get("/block/list?page=a&per_page=b")
      .set("Cookie", token)
      .send();
    expect(res.statusCode).toBe(400);
  });

  it("should return blocklist", async () => {
    const res = await supertest(app)
      .get("/block/list")
      .set("Cookie", token)
      .send();
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("result", {});
  });

  it("should throw 400 if check is invalid", async () => {
    const res = await supertest(app)
      .get("/block/check/a")
      .set("Cookie", token)
      .send();
    expect(res.statusCode).toBe(400);
  });

  it("should throw 404 if check unknown username", async () => {
    const res = await supertest(app)
      .get("/block/check/apple")
      .set("Cookie", token)
      .send();
    expect(res.statusCode).toBe(404);
  });

  it("should return yes is blocked", async () => {
    const strawberry = await getUser("strawberry");
    const blueberry = await getUser("blueberry");

    // Make strawberry block blueberry.
    await blockUser(strawberry.id, blueberry.id);

    const res = await supertest(app)
      .get("/block/check/strawberry")
      .set("Cookie", token)
      .send();
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("blocked", true);
  });

  it("should fail block 400 if username invalid", async () => {
    const res = await supertest(app)
      .post("/block")
      .set("Cookie", token)
      .send({ username: "" });
    expect(res.statusCode).toBe(400);
  });

  it("should fail block 404 if username not found", async () => {
    const res = await supertest(app)
      .post("/block")
      .set("Cookie", token)
      .send({ username: "apple" });
    expect(res.statusCode).toBe(404);
  });

  it("should block success with 200 and 201", async () => {
    const res = await supertest(app)
      .post("/block")
      .set("Cookie", token)
      .send({ username: "strawberry" });
    expect(res.statusCode).toBe(201);

    const res2 = await supertest(app)
      .post("/block")
      .set("Cookie", token)
      .send({ username: "strawberry" });
    expect(res2.statusCode).toBe(200);
  });
});
