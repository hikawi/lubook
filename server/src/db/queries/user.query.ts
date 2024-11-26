import { hashSync } from "bcryptjs";
import { eq, or } from "drizzle-orm";
import { db } from "..";
import { profiles } from "../schema/profile";
import { users } from "../schema/user";
import { lower } from "../utils";

/**
 * Finds the user, given a username or an email.
 *
 * @param query The query containing either a username or an email.
 * @returns The user, if found.
 */
export async function findUser(query: { username?: string; email?: string }) {
  if (!query.username && !query.email) {
    throw new Error("Both username and email wasn't supplied.");
  }

  return db
    .select()
    .from(users)
    .where(
      or(
        query.username
          ? eq(lower(users.username), query.username.toLowerCase())
          : undefined,
        query.email
          ? eq(lower(users.email), query.email.toLowerCase())
          : undefined
      )
    )
    .limit(1);
}

/**
 * Checks if a user exists.
 * @param query The query having a username or an email.
 * @returns True if the user exists, false otherwise.
 */
export async function existsUser(query: { username?: string; email?: string }) {
  return (await findUser(query)).length > 0;
}

/**
 * Creates a user, given a query. This does not perform checks. It will throw errors if you try to create a user, that violates unique constraints.
 * @param query The query, having the display name optional, username, email and password.
 */
export async function createUser(query: {
  name?: string;
  username: string;
  email: string;
  password: string;
}) {
  const user = await db
    .insert(users)
    .values({
      username: query.username,
      email: query.email,
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
    email: user[0].email,
  };
}
