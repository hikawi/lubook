import supertest from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import app from "../app";
import { clearDatabase, setupTestUsers } from "./utils";

describe("profile controller", () => {
  let cookie: string;

  beforeAll(async () => {
    await setupTestUsers();

    const res = await supertest(app).post("/login").send({
      profile: "strawberry",
      password: "strawberry",
    });
    expect(res.status).toBe(200);
    cookie = res.headers["set-cookie"];
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
      const res = await supertest(app).get("/profile").set("Cookie", cookie).send();
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("username", "strawberry");
    });
  });

  describe("get others", () => {
    it("should return nothing if not found", async () => {
      const res = await supertest(app).get("/profile/banana").send();
      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty("message");
    })

    it("should return blueberry", async () => {
      const res = await supertest(app).get("/profile/blueberry").send();
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("username", "blueberry");
    });
  });
});
