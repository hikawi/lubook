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
      username: users.username,
      email: users.email,
      name: profiles.name,
      bio: profiles.bio,
      avatar: profiles.avatar,
      verified: users.verified,
      followers: profiles.followers,
      followings: profiles.followings,
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
