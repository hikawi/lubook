import { eq } from "drizzle-orm";
import supertest from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import app from "../app";
import { db } from "../db";
import { tags, users } from "../db/schema";
import { clearDatabase, setupTestTags, setupTestUsers } from "./utils";

describe("tags controller", () => {
  const admin = supertest.agent(app);

  beforeAll(async () => {
    await Promise.all([setupTestTags(), setupTestUsers()]);
    const count = await db.$count(db.select().from(tags));
    expect(count).toBe(10);

    const res = await admin
      .post("/login")
      .send({ profile: "watermelon", password: "watermelon" });
    expect(res.statusCode).toBe(200);
  });

  afterAll(async () => {
    await clearDatabase();
  });

  it("blocks unauthorized accounts on crud routes", async () => {
    const res = await supertest(app).post("/tags").send();
    expect(res.statusCode).toBe(401);
  });

  it("blocks unprocessable entity on crud routes", async () => {
    const agent = supertest.agent(app);
    await agent
      .post("/login")
      .send({ profile: "strawberry", password: "strawberry" });
    await db.delete(users).where(eq(users.username, "strawberry"));

    const res = await agent.post("/tags").send();
    expect(res.statusCode).toBe(422);
  });

  it("blocks non-administrators", async () => {
    const mod = supertest.agent(app);
    await mod.post("/login").send({ profile: "kiwi", password: "kiwi" });

    const res = await mod.post("/tags").send();
    expect(res.statusCode).toBe(401);
  });

  describe("get all tags", () => {
    it("should block on bad request", async () => {
      const res = await admin
        .get("/tags")
        .query({ page: 1, per_page: -1.5 })
        .send();
      expect(res.statusCode).toBe(400);
    });

    it("should return with 2 pages", async () => {
      const res = await admin.get("/tags").query({ per_page: 5 }).send();
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("total", 10);
      expect(res.body).toHaveProperty("total_pages", 2);
    });
  });

  describe("create tag", () => {
    it("should block invalid body", async () => {
      const res = await admin.post("/tags").send({ name: "@@" });
      expect(res.statusCode).toBe(400);
    });

    it("should tell if already existed", async () => {
      const res = await admin.post("/tags").send({ name: "fanTASY" });
      expect(res.statusCode).toBe(409);
    });

    it("should create if not", async () => {
      const res = await admin.post("/tags").send({ name: "vitest" });
      expect(res.statusCode).toBe(201);

      await db.delete(tags).where(eq(tags.name, "vitest"));
    });
  });

  describe("edit tag", () => {
    it("should block invalid body", async () => {
      const res = await admin.put("/tags").send({ name: "aaaa" });
      expect(res.statusCode).toBe(400);
    });

    it("should block if ID not found", async () => {
      const res = await admin.put("/tags").send({ id: 11, name: "wee" });
      expect(res.statusCode).toBe(404);
    });

    it("should block if name is conflicting", async () => {
      const res = await admin.put("/tags").send({ id: 2, name: "FANTASY" });
      expect(res.statusCode).toBe(409);
    });

    it("should rename if correct", async () => {
      const res = await admin.put("/tags").send({ id: 10, name: "vitest" });
      expect(res.statusCode).toBe(200);
    });
  });

  describe("delete tag", () => {
    it("should block invalid body", async () => {
      const res = await admin.delete("/tags").send();
      expect(res.statusCode).toBe(400);
    });

    it("should block if ID not found", async () => {
      const res = await admin.delete("/tags").send({ id: 11 });
      expect(res.statusCode).toBe(404);
    });

    it("should delete if correct", async () => {
      const res = await admin.delete("/tags").send({ id: 10 });
      expect(res.statusCode).toBe(200);
    });
  });
});
