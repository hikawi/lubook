import supertest from "supertest";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import app from "../app";
import { db } from "../db";
import { blockUser } from "../db/queries/block.query";
import { getTagId } from "../db/queries/tag.query";
import { findUser } from "../db/queries/user.query";
import { blockTags, blockUsers } from "../db/schema";
import { clearDatabase, setupTestTags, setupTestUsers } from "./utils";

const agent = supertest.agent(app);

beforeAll(async () => {
  await setupTestUsers();
  const res = await agent
    .post("/login")
    .send({ profile: "blueberry", password: "blueberry" });
  expect(res.statusCode).toBe(200);
});

afterAll(async () => {
  await clearDatabase();
});

describe("block users", () => {
  afterEach(async () => {
    await db.delete(blockUsers);
  });

  async function getUser(username: string) {
    return (await findUser({ username }))![0];
  }

  describe("get list", () => {
    it("should throw 400 if bad blocklist", async () => {
      const res = await agent.get("/block/users?page=a&per_page=b").send();
      expect(res.statusCode).toBe(400);
    });

    it("should return blocklist", async () => {
      const res = await agent.get("/block/users").send();
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("results");
      expect(res.body).toHaveProperty("total", 0);
    });
  });

  describe("check block", () => {
    it("should throw 400 if check is invalid", async () => {
      const res = await agent.get("/block/users/a").send();
      expect(res.statusCode).toBe(400);
    });

    it("should throw 404 if check unknown username", async () => {
      const res = await agent.get("/block/users/apple").send();
      expect(res.statusCode).toBe(404);
    });

    it("should return yes is blocked", async () => {
      const strawberry = await getUser("strawberry");
      const blueberry = await getUser("blueberry");

      // Make strawberry block blueberry.
      await blockUser(strawberry.id, blueberry.id);

      const res = await agent.get("/block/users/strawberry").send();
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("blocked", true);
    });
  });

  describe("block", () => {
    it("should fail block 400 if username invalid", async () => {
      const res = await agent.post("/block/users").send({ username: "" });
      expect(res.statusCode).toBe(400);
    });

    it("should fail block 404 if username not found", async () => {
      const res = await agent.post("/block/users").send({ username: "apple" });
      expect(res.statusCode).toBe(404);
    });

    it("should block success with 200 and 201", async () => {
      const res = await agent
        .post("/block/users")
        .send({ username: "strawberry" });
      expect(res.statusCode).toBe(201);

      const res2 = await agent
        .post("/block/users")
        .send({ username: "strawberry" });
      expect(res2.statusCode).toBe(200);
    });
  });

  describe("unblock", () => {
    it("should fail 400 if bad username", async () => {
      const res = await agent.delete("/block/users").send({ username: "a" });
      expect(res.statusCode).toBe(400);
    });

    it("should fail 404 if can't find username", async () => {
      const res = await agent.delete("/block/users").send({ username: "lulu" });
      expect(res.statusCode).toBe(404);
    });

    it("should return 204 if not blocked", async () => {
      const res = await agent
        .delete("/block/users")
        .send({ username: "blueberry" });
      expect(res.statusCode).toBe(204);
    });

    it("should return 200 if unblocked success", async () => {
      await db.insert(blockUsers).values({
        user: (await getUser("blueberry")).id,
        blocked: (await getUser("strawberry")).id,
      });

      const res = await agent
        .delete("/block/users")
        .send({ username: "strawberry" });
      expect(res.statusCode).toBe(200);
    });
  });
});

describe("block tags", async () => {
  let blueberryId: number;

  beforeAll(async () => {
    await setupTestTags();
    blueberryId = (await findUser({ username: "blueberry" }))[0].id;
  });

  afterEach(async () => {
    await db.delete(blockTags);
  });

  describe("get blocked tags", () => {
    it("should throw error if invalid query", async () => {
      const res = await agent
        .get("/block/tags")
        .query({ page: -1, per_page: 20 })
        .send();
      expect(res.statusCode).toBe(400);
    });

    it("should return 2 blocked tags", async () => {
      const fantasyTag = await getTagId("fantasy");
      const romanceTag = await getTagId("romance");
      await db.insert(blockTags).values([
        { user: blueberryId, tag: fantasyTag },
        { user: blueberryId, tag: romanceTag },
      ]);

      const res = await agent.get("/block/tags").send();
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("results");
      expect(res.body).toHaveProperty("total", 2);
    });
  });

  describe("block a tag", () => {
    it("should throw error if invalid body", async () => {
      const res = await agent.post("/block/tags").send();
      expect(res.statusCode).toBe(400);
    });

    it("should say not found if given nonexistent tag", async () => {
      const res = await agent.post("/block/tags").send({ name: "lol" });
      expect(res.statusCode).toBe(404);
    });

    it("should block if properly", async () => {
      const res = await agent.post("/block/tags").send({ name: "fantasy" });
      expect(res.statusCode).toBe(201);

      const res2 = await agent.post("/block/tags").send({ name: "fanTASY" });
      expect(res2.statusCode).toBe(200);
    });
  });

  describe("unblock a tag", () => {
    it("should throw error if invalid body", async () => {
      const res = await agent.delete("/block/tags").send();
      expect(res.statusCode).toBe(400);
    });

    it("should say not found if given nonexistent tag", async () => {
      const res = await agent.delete("/block/tags").send({ name: "lol" });
      expect(res.statusCode).toBe(404);
    });

    it("should unblock if proper body", async () => {
      const res = await agent.delete("/block/tags").send({ name: "fantasy" });
      expect(res.statusCode).toBe(200);
    });
  });
});
