import * as pg from "drizzle-orm/pg-core";
import { mangas } from "./manga";

export const pages = pg.pgTable(
  "page",
  {
    manga: pg.serial().references(() => mangas.id),
    order: pg.integer(),
    fileName: pg.text("file_name").notNull(),
  },
  (self) => ({
    pagePk: pg.primaryKey({ columns: [self.manga, self.order] }),
  }),
);
