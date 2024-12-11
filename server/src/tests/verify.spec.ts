import { afterEach } from "node:test";
import supertest from "supertest";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import app from "../app";
import { db } from "../db";
import { generateVerification } from "../db/queries/verify.query";
import { verifications } from "../db/schema/verification";
import * as emailSender from "../misc/email-sender";
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
    it("returns 400 if bad verify check", async () => {
      const res = await supertest(app)
        .get("/verify/check")
        .query({ profile: "@@@" })
        .send();
      expect(res.statusCode).toBe(400);
    });

    it("returns 200 if good verify check", async () => {
      const res = await supertest(app)
        .get("/verify/check")
        .query({ profile: "luna" })
        .send();
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("verified", false);
    });
  });

  describe("with URL", async () => {
    it("returns 400 if URL verify bad params", async () => {
      const res = await supertest(app).get("/verify").send();
      expect(res.statusCode).toBe(302);
      expect(res.headers.location).toEqual(
        `${process.env.CORS_ORIGIN}/verify/failed`,
      );
    });

    it("returns 200 if success", async () => {
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
});
