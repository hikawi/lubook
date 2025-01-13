import { eq, or } from "drizzle-orm";
import { db } from "..";
import { profiles, users } from "../schema";

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
        data.username ? eq(users.username, data.username) : undefined,
      ),
    )
    .limit(1);
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
