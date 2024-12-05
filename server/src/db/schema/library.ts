import * as pg from "drizzle-orm/pg-core";
import { mangas } from "./manga";
import { users } from "./user";

export const libraryEntries = pg.pgTable(
  "libraryentry",
  {
    user: pg
      .serial("user_id")
      .notNull()
      .references(() => users.id),
    manga: pg
      .serial("manga_id")
      .notNull()
      .references(() => mangas.id),
  },
  (self) => ({
    pkLibraryEntry: pg.primaryKey({ columns: [self.user, self.manga] }),
  }),
);
