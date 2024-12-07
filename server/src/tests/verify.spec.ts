import { afterEach } from "node:test";
import supertest from "supertest";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import app from "../app";
import { emailTransport } from "../misc/email-sender";
import { clearDatabase } from "./utils";

describe("verification", async () => {
  let code: number;
  const sendEmailMock = vi.fn(async (object) => {
    const matcher = /(\d{6})/.exec(object.text);
    code = parseInt(matcher!.groups![1]);
    return {} as any;
  });

  beforeAll(() => {
    vi.spyOn(emailTransport, "sendMail").mockImplementation(sendEmailMock);
  });

  afterEach(async () => {
    await clearDatabase();
  });

  afterAll(() => {
    sendEmailMock.mockRestore();
  });

  it("returns 400 if bad verify check", async () => {
    const res = await supertest(app)
      .get("/verify")
      .query({ profile: "@@@" })
      .send();
    expect(res.statusCode).toBe(400);
  });

  it("returns 200 if good verify check", async () => {
    const res = await supertest(app)
      .get("/verify")
      .query({ profile: "luna" })
      .send();
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("verified", false);
  });
});
