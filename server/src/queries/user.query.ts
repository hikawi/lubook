import { hashSync } from "bcryptjs";
import { prisma } from "../db";

/**
 * Retrieves a user, either by username or by email.
 *
 * @param query The query having the username or email.
 * @returns The user, if found.
 */
export async function findUser(query: { username?: string; email?: string }) {
  return await prisma.user.findFirst({
    where: {
      OR: [
        { username: { equals: query.username, mode: "insensitive" } },
        { email: { equals: query.email, mode: "insensitive" } },
      ],
    },
  });
}

/**
 * Checks if a user exists, by username or by email.
 *
 * @param query The query having the username or email.
 * @returns True if the user exists, false otherwise.
 */
export async function existsUser(query: { username?: string; email?: string }) {
  return (await findUser(query)) != null;
}

export async function createUser(query: {
  username: string;
  email: string;
  password: string;
  name?: string;
}) {
  const user = await prisma.user.create({
    data: {
      username: query.username,
      email: query.email,
      password: hashSync(query.password, 12),
    },
  });
  const profile = await prisma.profile.create({
    data: {
      userId: user.id,
      name: query.name,
    },
  });

  return { ...user, name: profile.name };
}
