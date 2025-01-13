import { hashSync } from "bcryptjs";
import { eq } from "drizzle-orm";
import supertest from "supertest";
import { afterAll, describe, expect, it } from "vitest";
import app from "../app";
import { db } from "../db";
import { users } from "../db/schema";
import { clearDatabase } from "./utils";

afterAll(async () => {
  await clearDatabase();
});

describe("middlewares", () => {
  describe("auth middleware", () => {
    it("should block unautuhorized if not auth", async () => {
      const res = await supertest(app).get("/auth").send();
      expect(res.statusCode).toBe(401);
    });

    it("should block unprocessable entity if data is corrupted", async () => {
      const agent = supertest.agent(app);
      await db.insert(users).values({
        username: "test",
        password: hashSync("test", 12),
        email: "test@example.com",
        role: "user",
        verified: true,
      });
      const loginRes = await agent
        .post("/login")
        .send({ profile: "test", password: "test" });
      expect(loginRes.statusCode).toBe(200);

      await db.delete(users).where(eq(users.username, "test"));
      const res = await agent.get("/auth").send();
      expect(res.statusCode).toBe(422);
    });
  });
});
