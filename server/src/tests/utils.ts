import { hashSync } from "bcryptjs";
import { sql } from "drizzle-orm";
import { db } from "../db";
import { profiles } from "../db/schema/profile";
import { users } from "../db/schema/user";

export async function clearDatabase() {
  const tables = ["user", "profile"];
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
        },
        {
          username: "blackberry",
          password: hashSync("blackberry", 12),
          email: "blackberry@fruits.com",
          role: "user",
        },
        {
          username: "blueberry",
          password: hashSync("blueberry", 12),
          email: "blueberry@fruits.com",
          role: "user",
        },
        {
          username: "kiwi",
          password: hashSync("kiwi", 12),
          email: "kiwi@fruits.com",
          role: "moderator",
        },
        {
          username: "watermelon",
          password: hashSync("watermelon", 12),
          email: "watermelon@fruits.com",
          role: "admin",
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
