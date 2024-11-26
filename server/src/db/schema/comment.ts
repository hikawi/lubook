import * as pg from "drizzle-orm/pg-core";
import { chapters } from "./chapter";
import { mangas } from "./manga";
import { users } from "./user";

export const comments = pg.pgTable("comment", {
  id: pg.serial().primaryKey(),
  user: pg
    .serial("user_id")
    .references(() => users.id)
    .notNull(),
  manga: pg
    .serial("manga_id")
    .references(() => mangas.id, { onUpdate: "cascade" }),
  chapter: pg
    .integer("chapter_id")
    .references(() => chapters.number, { onUpdate: "cascade" }),
  time: pg.timestamp().notNull().defaultNow(),
  text: pg.text().notNull(),
});
