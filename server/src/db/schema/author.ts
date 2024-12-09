import * as pg from "drizzle-orm/pg-core";
import { mangas } from "./manga";
import { users } from "./user";

export const authors = pg.pgTable(
  "author",
  {
    user: pg
      .serial()
      .references(() => users.id)
      .notNull(),
    manga: pg
      .serial()
      .references(() => mangas.id)
      .notNull(),
  },
  (self) => ({
    userMangaPk: pg.primaryKey({ columns: [self.user, self.manga] }),
  }),
);
