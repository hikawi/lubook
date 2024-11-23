import { Profile } from "@/models/profile.model";
import { User } from "@/models/user.model";
import mongoose from "mongoose";
import { expect } from "vitest";

export async function setupTestUserProfiles() {
  // Make sure mongoose is connected.
  expect(mongoose.connection.readyState).toBe(1);

  const testUsers = [
    {
      username: "strawberry",
      password: "1234",
      email: "strawberry@fruits.com",
    },
    {
      username: "blueberry",
      password: "1234",
      email: "blueberry@fruits.com",
    },
    {
      username: "blackberry",
      password: "1234",
      email: "blackberry@fruits.com",
    },
  ];

  // If this throws, there's nothing to be done lmao.
  const users = await User.create(testUsers);
  await Profile.create(users.map((it) => new Profile({ username: it._id })));

  // Expect count to be the length of users.
  expect(await User.countDocuments()).toBe(testUsers.length);
  expect(await Profile.countDocuments()).toBe(testUsers.length);
}
