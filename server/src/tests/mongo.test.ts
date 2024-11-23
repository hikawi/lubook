import { describe, expect, it } from "vitest";
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
});
