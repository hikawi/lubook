import { eq } from "drizzle-orm";
import { db } from "..";
import { tags } from "../schema";
import { lower } from "../utils";

/**
 * Attempts to find the tag id from a tag string.
 *
 * @param tag The tag name
 * @returns The ID if found, -1 if not.
 */
export async function getTagId(tag: string) {
  const res = await db
    .select()
    .from(tags)
    .where(eq(lower(tags.name), tag.toLowerCase()));
  return res.length > 0 ? res[0].id : -1;
}

/**
 * Retrieves a list of tags.
 *
 * @param query The query to limit the list
 */
export async function getTags(query: { page: number; per_page: number }) {
  const results = await db
    .select({ name: tags.name })
    .from(tags)
    .orderBy(tags.name)
    .offset((query.page - 1) * query.per_page)
    .limit(query.per_page);
  const total = await db.$count(db.select().from(tags));

  return {
    results,
    total,
    total_pages: Math.ceil(total / query.per_page),
  };
}

/**
 * Create a tag
 *
 * @param tag the tag to add
 * @returns the query result
 */
export async function createTag(tag: string) {
  return await db
    .insert(tags)
    .values({ name: tag.toLowerCase() })
    .onConflictDoNothing();
}

/**
 * Delete a tag
 *
 * @param tag the tag to remove
 * @returns the query result
 */
export async function deleteTag(tag: string) {
  return await db
    .delete(tags)
    .where(eq(lower(tags.name), tag.toLowerCase()))
    .returning();
}
