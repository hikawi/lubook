import * as pg from "drizzle-orm/pg-core";

export const role = pg.pgEnum("role", ["user", "moderator", "admin"]);

export const user = pg.pgTable("user", {
  id: pg.serial().primaryKey(),
  username: pg.varchar({ length: 32 }).notNull().unique(),
  email: pg.text().notNull().unique(),
  password: pg.char({ length: 60 }).notNull(),
  role: role(),
  joined: pg.timestamp().defaultNow(),
});
