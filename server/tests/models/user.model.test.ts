import { User } from "@/models/user.model";
import { setupTestUserProfiles } from "@/utils/user-test-utils";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";

describe("user model", async () => {
  let mongoDb: MongoMemoryServer;

  beforeAll(async () => {
    mongoDb = await MongoMemoryServer.create();
    await mongoose.connect(mongoDb.getUri());
  });

  beforeEach(async () => {
    await setupTestUserProfiles();
  });

  afterEach(async () => {
    await mongoose.connection.dropDatabase();
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoDb.stop();
  });

  it("should not rehash if user doesn't change password", async () => {
    const before = await User.findOneAndUpdate(
      { username: "strawberry" },
      { $set: { username: "raspberry" } },
      { returnDocument: "before" },
    );

    const strawberry = await User.findOne({ username: "strawberry" });
    const raspberry = await User.findOne({ username: "raspberry" });
    expect(strawberry).toBeNull();
    expect(raspberry).toBeDefined();
    expect(raspberry?.password).toEqual(before?.password);
  });

  it("should rehash if user changed password", async () => {
    const before = await User.findOneAndUpdate(
      { username: "strawberry" },
      { $set: { password: "5678" } },
      { returnDocument: "before" },
    );

    const strawberry = await User.findOne({ username: "strawberry" });
    expect(strawberry?.username).toEqual(before?.username);
    expect(strawberry?.password).not.toEqual(before?.password);
  });
});
