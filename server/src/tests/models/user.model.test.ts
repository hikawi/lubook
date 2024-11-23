import mongoose from "mongoose";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { connectMongo, disconnectMongo } from "../../db";
import { User } from "../../models/user.model";
import { setupTestUserProfiles } from "../../utils/user-test-utils";

describe("user model", async () => {
  beforeAll(async () => {
    await connectMongo();
  });

  beforeEach(async () => {
    await setupTestUserProfiles();
  });

  afterEach(async () => {
    await mongoose.connection.dropDatabase();
  });

  afterAll(async () => {
    await disconnectMongo();
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
