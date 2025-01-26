import { eq, or } from "drizzle-orm";
import { db } from "..";
import { profiles, users } from "../schema";
import { lower } from "../utils";

/**
 * Retrieve the user's profile
 *
 * @param data The user's data
 */
export async function getProfile(data: { id?: number; username?: string }) {
  return await db
    .select({
      id: users.id,
      username: users.username,
      email: users.email,
      name: profiles.name,
      bio: profiles.bio,
      role: users.role,
      avatar: profiles.avatar,
      followers: profiles.followers,
      followings: profiles.followings,
      publications: profiles.publications,
    })
    .from(users)
    .innerJoin(profiles, eq(users.id, profiles.user))
    .where(
      or(
        data.id ? eq(users.id, data.id) : undefined,
        data.username
          ? eq(lower(users.username), data.username.toLowerCase())
          : undefined,
      ),
    )
    .limit(1);
}

/**
 * Update a user's profile.
 *
 * @param data The data to update to the user with user ID.
 */
export async function updateProfile(data: {
  id: number;
  penName?: string;
  username: string;
  biography?: string;
}) {
  console.log(data);
  await db.transaction(async (ctx) => {
    await ctx
      .update(users)
      .set({ username: data.username })
      .where(eq(users.id, data.id));
    await ctx
      .update(profiles)
      .set({
        name: data.penName || null,
        bio: data.biography || null,
      })
      .where(eq(profiles.user, data.id));
  });
}

/**
 * Updates an avatar to a URL.
 *
 * @param data The data to update
 * @returns The query result
 */
export async function updateAvatar(data: { id: number; url: string }) {
  return await db
    .update(profiles)
    .set({ avatar: data.url })
    .where(eq(profiles.user, data.id));
}

/**
 * Delete an avatar from a profile.
 *
 * @param id The User ID
 * @returns The query result
 */
export async function deleteAvatar(id: number) {
  return await db
    .update(profiles)
    .set({ avatar: `${process.env.S3_BASE}/avatars/default.png` })
    .where(eq(profiles.user, id));
}
