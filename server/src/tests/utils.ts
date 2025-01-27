import { hashSync } from "bcryptjs";
import { sql } from "drizzle-orm";
import { db } from "../db";
import { profiles, tags, users } from "../db/schema";

export async function clearDatabase() {
  const tables = ["user", "profile", "tag"];
  for (const table of tables) {
    await db.execute(
      sql.raw(`truncate table \"${table}\" restart identity cascade;`),
    );
  }
}

export async function setupTestUsers() {
  await db.transaction(async (ctx) => {
    const data = await ctx
      .insert(users)
      .values([
        {
          username: "strawberry",
          password: hashSync("strawberry", 12),
          email: "strawberry@fruits.com",
          role: "user",
          verified: true,
        },
        {
          username: "blackberry",
          password: hashSync("blackberry", 12),
          email: "blackberry@fruits.com",
          role: "user",
          verified: true,
        },
        {
          username: "blueberry",
          password: hashSync("blueberry", 12),
          email: "blueberry@fruits.com",
          role: "user",
          verified: true,
        },
        {
          username: "kiwi",
          password: hashSync("kiwi", 12),
          email: "kiwi@fruits.com",
          role: "moderator",
          verified: true,
        },
        {
          username: "watermelon",
          password: hashSync("watermelon", 12),
          email: "watermelon@fruits.com",
          role: "admin",
          verified: true,
        },
      ])
      .returning();

    await ctx.insert(profiles).values(
      data.map((node) => {
        return {
          user: node.id,
          name: `${node.username} profile`,
          bio: "I love fruits",
        };
      }),
    );
  });
}

/**
 * Sets up 10 tags (also called categories or genres) for testing purposes.
 */
export async function setupTestTags() {
  const names = [
    "fantasy",
    "action",
    "shonen",
    "shojo",
    "romcom",
    "yoshi",
    "comedy",
    "slice of life",
    "education",
    "romance",
  ];
  await db.insert(tags).values(names.map((name) => ({ name })));
}
