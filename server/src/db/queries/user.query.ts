import { hashSync } from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "..";
import { profiles } from "../schema/profile";
import { users } from "../schema/user";
import { lower } from "../utils";

/**
 * Finds the user, given a username.
 *
 * @param username The username
 * @returns The user, if found.
 */
export async function findUser(username: string) {
  return db
    .select()
    .from(users)
    .where(eq(lower(users.username), username.toLowerCase()))
    .limit(1);
}

/**
 * Searches a user by their ID.
 *
 * @param id the ID
 * @returns the user list
 */
export async function findUserById(id: number) {
  return db.select().from(users).where(eq(users.id, id)).limit(1);
}

/**
 * Checks if a user exists.
 * @param username The user's username
 * @returns True if the user exists, false otherwise.
 */
export async function existsUser(username: string) {
  return (await findUser(username)).length > 0;
}

/**
 * Creates a user, given a query. This does not perform checks. It will throw errors if you try to create a user, that violates unique constraints.
 * @param query The query, having the display name optional, username, email and password.
 */
export async function createUser(query: {
  name?: string;
  username: string;
  password: string;
}) {
  const user = await db
    .insert(users)
    .values({
      username: query.username,
      password: hashSync(query.password, 12),
      role: "user",
    })
    .returning();
  const profile = await db
    .insert(profiles)
    .values({
      user: user[0].id,
      name: query.name,
    })
    .returning();

  return {
    name: profile[0].name,
    username: user[0].username,
  };
}
