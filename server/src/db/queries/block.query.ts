import { and, eq } from "drizzle-orm";
import { db } from "..";
import { blockTags, blockUsers, profiles, tags, users } from "../schema";

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
export async function getBlockedUsers(query: {
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
    page: query.page,
    total_pages: Math.ceil(total / query.page),
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

/**
 * Retrieves a paginated list of tags the user has blocked.
 *
 * @param query The query to execute
 * @returns A list of tags the user has blocked.
 */
export async function getBlockTags(query: {
  user: number;
  page: number;
  per_page: number;
}) {
  const results = await db
    .select({
      name: tags.name,
    })
    .from(blockTags)
    .innerJoin(tags, eq(blockTags.tag, tags.id))
    .where(eq(blockTags.user, query.user))
    .offset((query.page - 1) * query.per_page)
    .limit(query.per_page);
  const total = await db.$count(
    db.select().from(blockTags).where(eq(blockTags.user, query.user)),
  );

  return {
    results,
    total,
    total_page: Math.ceil(total / query.page),
  };
}

/**
 * Blocks a tag.
 *
 * @param user The user that is blocking.
 * @param tag The tag to block.
 * @returns Rows affected count
 */
export async function blockTag(user: number, tag: number) {
  const res = await db
    .insert(blockTags)
    .values({ user, tag })
    .onConflictDoNothing();
  return res.rowCount || 0;
}

/**
 * Unblocks a tag.
 *
 * @param user The user that is unblocking.
 * @param tag The tag to unblock.
 * @returns Rows affected count
 */
export async function unblockTag(user: number, tag: number) {
  const res = await db
    .delete(blockTags)
    .where(and(eq(blockTags.user, user), eq(blockTags.tag, tag)));
  return res.rowCount || 0;
}
