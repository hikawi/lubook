import * as pg from "drizzle-orm/pg-core";

export const tags = pg.pgTable("tag", {
  id: pg.serial().primaryKey(),
  name: pg.text(),
});
