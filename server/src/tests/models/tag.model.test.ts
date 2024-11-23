import mongoose from "mongoose";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { connectMongo, disconnectMongo } from "../../db";
import { Tag } from "../../models/tag.model";

describe("tag model", async () => {
  beforeAll(async () => {
    await connectMongo();
  });

  beforeEach(async () => {
    await Tag.syncIndexes();
  });

  afterEach(async () => {
    await mongoose.connection.collection("Tag").dropIndexes();
    await mongoose.connection.dropDatabase();
  });

  afterAll(async () => {
    await disconnectMongo();
  });

  it("should have empty table", async () => {
    expect(await Tag.countDocuments()).toBe(0);
  });

  it("should create tag and match case insensitive", async () => {
    const created = await Tag.create({ name: "Test" });
    expect(await Tag.exists({ _id: created._id }));
    expect(await Tag.exists({ name: "test" }));
    expect(await Tag.countDocuments({})).toBe(1);
    await expect(Tag.create({ name: "teST" })).rejects.toThrow();
  });

  it("should trim tags", async () => {
    await Tag.create({ name: "Tag    " });
    expect(await Tag.countDocuments()).toBe(1);
    expect(await Tag.find({ name: "tag" })).toBeDefined();
  });
});
