import { and, eq } from "drizzle-orm";
import { db } from "..";
import { blockUsers } from "../schema/block";
import { users } from "../schema/user";

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
export async function getBlockList(
  user: number,
  page: number,
  per_page: number,
) {
  const res = await db
    .select({
      username: users.username,
    })
    .from(users)
    .innerJoin(blockUsers, eq(users.id, blockUsers.blocked))
    .where(eq(blockUsers.user, user))
    .offset((page - 1) * per_page)
    .limit(per_page);
  return res.map((row) => row.username);
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
