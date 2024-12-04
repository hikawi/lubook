import * as pg from "drizzle-orm/pg-core";
import { lower } from "../utils";

export const roles = pg.pgEnum("userrole", ["user", "moderator", "admin"]);

export const users = pg.pgTable(
  "user",
  {
    id: pg.serial().primaryKey(),
    username: pg.varchar({ length: 32 }).notNull().unique(),
    email: pg.text().notNull().unique(),
    password: pg.char({ length: 60 }).notNull(),
    role: roles().notNull(),
    joined: pg.timestamp().defaultNow().notNull(),
    verified: pg.boolean().notNull().default(false),
  },
  (self) => ({
    usernameIndex: pg.uniqueIndex("user_username_idx").on(lower(self.username)),
    emailIndex: pg.uniqueIndex("user_email_idx").on(lower(self.email)),
  })
);
