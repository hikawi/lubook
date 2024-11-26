import * as pg from "drizzle-orm/pg-core";
import { users } from "./user";

export const profiles = pg.pgTable("profile", {
  id: pg.serial().primaryKey(),
  user: pg
    .serial("user_id")
    .unique()
    .references(() => users.id),
  name: pg.text(),
  bio: pg.text(),
  followers: pg.integer().notNull().default(0),
  followings: pg.integer().notNull().default(0),
  publications: pg.integer().notNull().default(0),
  chapters: pg.integer().notNull().default(0),
});
