import supertest from "supertest";
import { afterEach, describe, expect, it, vi } from "vitest";
import { prisma } from "../db";
import { createUser } from "../queries/user.query";
import { resetDatabase } from "../utils/test-utils";

describe("user actions", async () => {
  afterEach(async () => {
    await resetDatabase();
    expect(await prisma.user.count()).toBe(0);
    vi.resetModules();
  });

  it("should not register if bad request", async () => {
    const app = await import("../app");
    const res = await supertest(app.default)
      .post("/register")
      .send({ username: "luna$@", password: "1234", email: "luna@email" });
    expect(res.statusCode).toBe(400);
  });

  it("should not register if already setup", async () => {
    await createUser({
      username: "luna",
      email: "luna@email.com",
      password: "1234",
    });
    const app = await import("../app");
    const res = await supertest(app.default).post("/register").send({
      username: "luna",
      email: "luna@email.co",
      password: "1234",
    });
    expect(res.statusCode).toBe(409);
  });
});
