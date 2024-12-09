import * as pg from "drizzle-orm/pg-core";

export const mangaStatuses = pg.pgEnum("mangastatus", [
  "ongoing",
  "abandoned",
  "finished",
]);

export const mangas = pg.pgTable("manga", {
  id: pg.serial().primaryKey(),
  name: pg.text().notNull(),
  description: pg.text().notNull(),
  status: mangaStatuses().default("ongoing").notNull(),
  uploadDate: pg.timestamp("upload_date").notNull(),
  lastUpdatedDate: pg.timestamp("last_updated").notNull(),
});
