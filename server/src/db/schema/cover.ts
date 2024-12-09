import * as pg from "drizzle-orm/pg-core";
import { chapters } from "./chapter";
import { mangas } from "./manga";

export const mangaCovers = pg.pgTable("manga_cover", {
  manga: pg
    .serial()
    .references(() => mangas.id)
    .primaryKey(),
  fileName: pg.text("file_name"),
});

export const chapterCovers = pg.pgTable(
  "chapter_cover",
  {
    manga: pg.serial(),
    chapter: pg.integer(),
    fileName: pg.text("file_name"),
  },
  (table) => ({
    chapterCoverPk: pg.primaryKey({ columns: [table.manga, table.chapter] }),
    chapterCoverFk: pg.foreignKey({
      columns: [table.manga, table.chapter],
      foreignColumns: [chapters.manga, chapters.number],
    }),
  }),
);
