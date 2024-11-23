import mongoose from "mongoose";
import { describe, expect, it, vi } from "vitest";
import { connectMongo, disconnectMongo } from "../db";

describe("real mongo connection", () => {
  it("should connect and disconnect", async () => {
    await expect(connectMongo()).resolves.not.toThrow();
    await expect(disconnectMongo()).resolves.not.toThrow();
  });

  it("should not duplicate connection", async () => {
    const inst = await connectMongo();
    const inst2 = await connectMongo();

    expect(inst).toBe(inst2);
    await disconnectMongo();
  });

  it("should terminate gracefully", async () => {
    await import("../db");

    const mockFn = vi.spyOn(process, "exit").mockImplementation((num) => num as never);
    process.emit("SIGTERM");

    await vi.waitFor(() => {
      expect(mockFn).toHaveBeenCalled();
      expect(mongoose.connection.readyState).not.toBe(1);
    });
    mockFn.mockRestore();
  });
});
