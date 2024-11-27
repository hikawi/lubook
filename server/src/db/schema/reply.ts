import * as pg from "drizzle-orm/pg-core";
import { comments } from "./comment";
import { users } from "./user";

export const replies = pg.pgTable("reply", {
  id: pg.serial().primaryKey(),
  comment: pg
    .serial("comment_id")
    .references(() => comments.id, { onDelete: "cascade" })
    .notNull(),
  user: pg
    .serial("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  text: pg.text().notNull(),
  time: pg.timestamp().notNull().defaultNow(),
});
