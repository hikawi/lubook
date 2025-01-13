import supertest from "supertest";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import app from "../app";
import { s3 } from "../db";
import { clearDatabase, setupTestUsers } from "./utils";

describe("profile controller", () => {
  const agent = supertest.agent(app);

  beforeAll(async () => {
    await setupTestUsers();

    const res = await agent
      .post("/login")
      .send({ profile: "strawberry", password: "strawberry" });
    expect(res.statusCode).toBe(200);
  });

  afterAll(async () => {
    await clearDatabase();
  });

  describe("get me", () => {
    it("should block without token", async () => {
      const res = await supertest(app).get("/profile").send();
      expect(res.status).toBe(401);
    });

    it("should return strawberry with token", async () => {
      const res = await agent.get("/profile").send();
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("username", "strawberry");
    });
  });

  describe("get others", () => {
    it("should return nothing if not found", async () => {
      const res = await supertest(app).get("/profile").query({ "username": "banana" }).send();
      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty("message");
    });

    it("should error 400 if username invalid", async () => {
      const res = await supertest(app).get("/profile").query({ "username": "a" }).send();
      expect(res.statusCode).toBe(400);
    });

    it("should return blueberry", async () => {
      const res = await supertest(app)
        .get("/profile")
        .query({ "username": "blueberry" })
        .send();
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("username", "blueberry");
    });
  });

  describe("update avatar", () => {
    it("should block if no image sent", async () => {
      const res = await agent.post("/profile/avatar").send();
      expect(res.statusCode).toBe(400);
    });

    it("should block if unsupported image type", async () => {
      const res = await agent
        .post("/profile/avatar")
        .attach("file", "src/tests/images/profile-test.svg", {
          contentType: "image/svg",
        });
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("supported");
    });

    it("should call if supported image type", async () => {
      let param: any;
      const sendFn = vi.fn((obj) => (param = obj));
      vi.spyOn(s3, "send").mockImplementationOnce(sendFn);

      const res = await agent
        .post("/profile/avatar")
        .attach("file", "src/tests/images/profile-test.png", {
          contentType: "image/png",
        });
      expect(res.statusCode).toBe(201);
      expect(sendFn).toHaveBeenCalledOnce();
      expect(param).toBeDefined();
    });
  });

  describe("delete avatar", () => {
    it("should return 200 after calling send", async () => {
      const sendFn = vi.fn();
      vi.spyOn(s3, "send").mockImplementationOnce(sendFn);

      const res = await agent.delete("/profile/avatar").send();
      expect(sendFn).toHaveBeenCalledOnce();
      expect(res.statusCode).toBe(200);
    });
  });
});
