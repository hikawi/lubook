import { eq } from "drizzle-orm";
import { afterEach } from "node:test";
import supertest from "supertest";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import app from "../app";
import { db } from "../db";
import { generateVerification } from "../db/queries/verify.query";
import { users, verifications } from "../db/schema";
import * as emailSender from "../misc/email-sender";
import { Status } from "../misc/status";
import { clearDatabase, setupTestUsers } from "./utils";

describe("verification", async () => {
  let code: string;
  let link: string;
  let username: string;
  let token: string;

  const sendVerifyMock = vi.fn(
    async (data: {
      name: string;
      code: string;
      email: string;
      link: string;
    }) => {
      code = data.code;
      link = data.link;

      const matcher = /username=(.+)&token=(.+)/.exec(link)!;
      username = matcher[1];
      token = matcher[2];
    },
  );

  beforeAll(async () => {
    vi.resetModules();
    vi.spyOn(emailSender, "sendVerificationEmail").mockImplementation(
      sendVerifyMock,
    );

    await setupTestUsers();
  });

  afterEach(async () => {
    sendVerifyMock.mockClear();
    await db.delete(verifications);
  });

  afterAll(async () => {
    sendVerifyMock.mockRestore();
    await clearDatabase();
  });

  describe("check", async () => {
    it("returns BAD_REQUEST if bad verify check", async () => {
      const res = await supertest(app)
        .get("/verify/check")
        .query({ profile: "@@@" })
        .send();
      expect(res.statusCode).toBe(Status.BAD_REQUEST);
    });

    it("returns OK if good verify check", async () => {
      const res = await supertest(app)
        .get("/verify/check")
        .query({ profile: "luna" })
        .send();
      expect(res.statusCode).toBe(Status.OK);
      expect(res.body).toHaveProperty("verified", false);
    });
  });

  describe("with URL", async () => {
    it("returns /failed if URL verify bad params", async () => {
      const res = await supertest(app).get("/verify").send();
      expect(res.statusCode).toBe(302);
      expect(res.headers.location).toEqual(
        `${process.env.CORS_ORIGIN}/verify/failed`,
      );
    });

    it("returns /failed if bad token", async () => {
      const bool = await generateVerification("strawberry");
      expect(bool).toBeTruthy();
      expect(sendVerifyMock).toHaveBeenCalledOnce();

      const res = await supertest(app)
        .get("/verify")
        .query({
          username,
          token: "notatoken",
        })
        .send();
      expect(res.statusCode).toBe(302);
      expect(res.headers.location).toEqual(
        `${process.env.CORS_ORIGIN}/verify/failed`,
      );

      sendVerifyMock.mockClear();
    });

    it("returns /success if success", async () => {
      const bool = await generateVerification("strawberry");
      expect(bool).toBeTruthy();
      expect(sendVerifyMock).toHaveBeenCalledOnce();

      const res = await supertest(app)
        .get("/verify")
        .query({
          username,
          token,
        })
        .send();
      expect(res.statusCode).toBe(302);
      expect(res.headers.location).toEqual(
        `${process.env.CORS_ORIGIN}/verify/success`,
      );
    });
  });

  describe("request new code", () => {
    beforeAll(() => {
      vi.useFakeTimers();
    });

    afterAll(() => {
      vi.useRealTimers();
    });

    it("returns BAD_REQUEST if not valid schema", async () => {
      const res = await supertest(app)
        .post("/verify/request")
        .send({ profile: "strawberr@" });
      expect(res.statusCode).toBe(Status.BAD_REQUEST);
    });

    it("returns NOT MODIFIED if already verified", async () => {
      await db
        .update(users)
        .set({ verified: true })
        .where(eq(users.username, "strawberry"));
      const res = await supertest(app)
        .post("/verify/request")
        .send({ profile: "strawberry" });
      expect(res.statusCode).toBe(Status.NOT_MODIFIED);
    });

    it("returns NOT FOUND if not found the user", async () => {
      const res = await supertest(app)
        .post("/verify/request")
        .send({ profile: "straw" });
      expect(res.statusCode).toBe(Status.NOT_FOUND);
    });

    it("returns CREATED if generated", async () => {
      sendVerifyMock.mockClear();
      await db
        .update(users)
        .set({ verified: false })
        .where(eq(users.username, "strawberry"));
      await db.delete(verifications);

      const res = await supertest(app)
        .post("/verify/request")
        .send({ profile: "strawberry" });
      expect(res.statusCode).toBe(Status.CREATED);
      expect(sendVerifyMock).toHaveBeenCalledOnce();
    });
  });

  describe("with token", () => {
    it("returns BAD_REQUEST if not a 6-digit code", async () => {
      const res = await supertest(app)
        .post("/verify")
        .send({ profile: "strawberry", code: "12345" });
      expect(res.statusCode).toBe(Status.BAD_REQUEST);
    });

    it("returns OK if verified successfully", async () => {
      const res = await supertest(app)
        .post("/verify")
        .send({ profile: "strawberry", code });
      expect(res.statusCode).toBe(Status.OK);
    });
  });
});
