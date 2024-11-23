import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { Following } from "../../models/following.model";
import { Profile } from "../../models/profile.model";
import { User } from "../../models/user.model";
import { setupTestUserProfiles } from "../../utils/user-test-utils";

describe("profile model", async () => {
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

  it("should update following count", async () => {
    const strawberry = await User.findOne({ username: "strawberry" });
    const blueberry = await User.findOne({ username: "blueberry" });
    expect(strawberry).toBeDefined();
    expect(blueberry).toBeDefined();

    // Make blueberry follow strawberry.
    await Following.create({
      followed: strawberry?._id,
      follower: blueberry?._id,
    });

    // Find the profiles after the update.
    let strawProfile = await Profile.findOne({ username: strawberry?._id });
    let blueProfile = await Profile.findOne({ username: blueberry?._id });
    expect(strawProfile).toBeDefined();
    expect(blueProfile).toBeDefined();

    // Make sure the count is updated correctly (strawberry has 1 follower, blueberry has 1 following.)
    expect(await Following.countDocuments({})).toBe(1);
    expect(strawProfile?.follower_count).toBe(1);
    expect(blueProfile?.following_count).toBe(1);

    // Now we remove.
    await Following.findOneAndDelete({
      followed: strawberry?.id,
      follower: blueberry?._id,
    });

    // Find the profiles after the removal.
    strawProfile = await Profile.findOne({ username: strawberry?._id });
    blueProfile = await Profile.findOne({ username: blueberry?._id });

    // Make sure the count is updated correctly (strawberry has 0 followers, blueberry has 0 followings).
    expect(await Following.countDocuments({})).toBe(0);
    expect(strawProfile?.follower_count).toBe(0);
    expect(blueProfile?.following_count).toBe(0);
  });

  it("should disallow deleting normally without findOneAndDelete", async () => {
    const strawberry = await User.findOne({ username: "strawberry" });
    const blueberry = await User.findOne({ username: "blueberry" });
    await Following.create({
      followed: strawberry?._id,
      follower: blueberry?._id,
    });

    await expect(Following.deleteOne({ username: strawberry?._id })).rejects.toThrow();
    await expect(Following.deleteMany({ username: strawberry?._id })).rejects.toThrow();
  });
});
