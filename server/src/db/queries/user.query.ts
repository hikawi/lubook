import { hashSync } from "bcryptjs";
import { eq, or } from "drizzle-orm";
import { db } from "..";
import { profiles } from "../schema/profile";
import { users } from "../schema/user";
import { lower } from "../utils";

/**
 * Finds the user, given a username or an email. This matches
 * with WHERE username = $1 OR email = $2.
 *
 * @param query The username or an email.
 * @returns The user, if found.
 */
export async function findUser(query: { username?: string; email?: string }) {
  const { username, email } = query;
  return db
    .select()
    .from(users)
    .where(
      or(
        username
          ? eq(lower(users.username), username.toLowerCase())
          : undefined,
        email ? eq(lower(users.email), email.toLowerCase()) : undefined,
      ),
    )
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
 *
 * @param query The query containing an email or a username.
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
  email: string;
  username: string;
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

  // sendVerificationEmail(user[0].id, user[0].username, user[0].email);
  return {
    name: profile[0].name,
    email: user[0].email,
    username: user[0].username,
  };
}
