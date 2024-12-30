import { eq } from "drizzle-orm";
import { db } from "..";
import { profiles, users } from "../schema";

/**
 * Retrieve the user's profile
 *
 * @param id The user's ID
 */
export async function getProfile(id: number) {
  return await db
    .select({
      username: users.username,
      email: users.email,
      name: profiles.name,
      bio: profiles.bio,
      verified: users.verified,
      followers: profiles.followers,
      followings: profiles.followings,
    })
    .from(users)
    .innerJoin(profiles, eq(users.id, profiles.user))
    .where(eq(users.id, id))
    .limit(1);
}
