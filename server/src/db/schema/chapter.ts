import * as pg from "drizzle-orm/pg-core";
import { mangas } from "./manga";

export const chapters = pg.pgTable(
  "chapter",
  {
    manga: pg
      .serial("manga_id")
      .notNull()
      .references(() => mangas.id),
    number: pg.integer().notNull(),
    name: pg.text().notNull(),
    description: pg.text(),
    uploadDate: pg.timestamp("upload_date").defaultNow().notNull(),
    lastModifiedDate: pg.timestamp("last_modified_date").notNull().defaultNow(),
    disableComments: pg.boolean().notNull().default(true),
  },
  (self) => ({
    pkChapter: pg.primaryKey({ columns: [self.manga, self.number] }),
  })
);
