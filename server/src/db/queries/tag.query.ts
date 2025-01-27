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
 * Check if the tag name is taken.
 *
 * @param tag the tag to check
 * @returns true if taken, false if not
 */
export async function isTagTaken(tag: string) {
  return (await getTagId(tag)) != -1;
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
    .values({ name: tag })
    .returning()
    .onConflictDoNothing();
}

/**
 * Delete a tag
 *
 * @param id the tag to remove
 * @returns the query result
 */
export async function deleteTag(id: number) {
  return await db.delete(tags).where(eq(tags.id, id)).returning();
}

/**
 * Edits a tag.
 *
 * @param id the ID to edit
 * @param tag the new name to edit to
 * @returns the query result
 */
export async function editTag(id: number, tag: string) {
  return await db
    .update(tags)
    .set({ name: tag })
    .where(eq(tags.id, id))
    .returning();
}
