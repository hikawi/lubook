import { and, eq } from "drizzle-orm";
import { db } from "..";
import { blockUsers, profiles, users } from "../schema";

/**
 * Checks if the {blocker} has blocked the {blocked}.
 *
 * @param blocker The one that blocks
 * @param blocked The one that gets blocked.
 */
export async function isUserBlocked(blocker: number, blocked: number) {
  const res = await db
    .select()
    .from(blockUsers)
    .where(and(eq(blockUsers.user, blocker), eq(blockUsers.blocked, blocked)))
    .limit(1);
  return res.length > 0;
}

/**
 * Retrieves a user's block list as a list of usernames.
 *
 * @param user The user
 * @param page The page (indexed from 1)
 * @param per_page The number per pages
 */
export async function getBlockList(query: {
  user: number;
  page: number;
  per_page: number;
}) {
  const results = await db
    .select({
      username: users.username,
      name: profiles.name,
      email: users.email,
      avatar: profiles.avatar,
    })
    .from(users)
    .innerJoin(blockUsers, eq(users.id, blockUsers.blocked))
    .innerJoin(profiles, eq(users.id, profiles.id))
    .where(eq(blockUsers.user, query.user))
    .offset((query.page - 1) * query.per_page)
    .limit(query.per_page);
  const total = await db.$count(
    db.select().from(blockUsers).where(eq(blockUsers.user, query.user)),
  );

  return {
    total,
    results,
  };
}

/**
 * Blocks a user.
 *
 * @param blocker The one that blocks
 * @param blocked The one that gets blocked
 */
export async function blockUser(blocker: number, blocked: number) {
  const res = await db
    .insert(blockUsers)
    .values({ user: blocker, blocked })
    .onConflictDoNothing();
  return res.rowCount;
}

/**
 * Unblocks a user.
 *
 * @param blocker The one that blocks
 * @param blocked The one that gets blocked
 */
export async function unblockUser(blocker: number, blocked: number) {
  const res = await db
    .delete(blockUsers)
    .where(and(eq(blockUsers.user, blocker), eq(blockUsers.blocked, blocked)));
  return res.rowCount;
}
