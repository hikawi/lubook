import { hash } from "bcryptjs";
import mongoose from "mongoose";
import { expect } from "vitest";
import { Profile } from "../models/profile.model";
import { User } from "../models/user.model";

export async function setupTestUserProfiles() {
  // Make sure mongoose is connected.
  expect(mongoose.connection.readyState).toBe(1);

  const testUsers = [
    {
      username: "strawberry",
      password: await hash("1234", 10),
      email: "strawberry@fruits.com",
    },
    {
      username: "blueberry",
      password: await hash("1234", 10),
      email: "blueberry@fruits.com",
    },
    {
      username: "blackberry",
      password: await hash("1234", 10),
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
