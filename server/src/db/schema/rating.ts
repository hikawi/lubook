import * as pg from "drizzle-orm/pg-core";
import { mangas } from "./manga";
import { users } from "./user";

export const ratings = pg.pgTable("rating", {
  user: pg.serial("user_id").references(() => users.id),
  manga: pg.serial("manga_id").references(() => mangas.id),
  rating: pg.real().notNull(),
  comment: pg.text(),
});
