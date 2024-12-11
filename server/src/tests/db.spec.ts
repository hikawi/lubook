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
