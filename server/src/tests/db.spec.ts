import expressAsyncHandler from "express-async-handler";
import supertest from "supertest";
import { afterAll, describe, expect, it, vi } from "vitest";
import app from "../app";
import { db, disconnect } from "../db";

describe("database", () => {
  afterAll(async () => {
    await disconnect();
  });

  it("should connect fine", async () => {
    const result = await db.execute("select 1;");
    expect(result.rowCount).toBe(1);
    expect(result.rows[0]).toMatchObject({ "?column?": 1 });
  });

  it("should start listening", async () => {
    const mockListen = vi.fn((port, callback) => {
      callback();
      return null as any;
    });
    vi.spyOn(app, "listen").mockImplementation(mockListen);

    await import("../index");
    expect(mockListen).toHaveBeenCalledOnce();
    mockListen.mockRestore();
  });
});

describe("server instance", () => {
  it("should catch / for uptime robot", async () => {
    const res = await supertest(app).get("/").send();
    expect(res.statusCode).toBe(200);
  });

  it("should catch errors and return 500 if anything happens", async () => {
    app.get(
      "/error",
      expressAsyncHandler(async (req, res) => {
        throw new Error();
      }),
    );
    const res = await supertest(app).get("/error").send();
    expect(res.statusCode).toBe(500);
  });
});
