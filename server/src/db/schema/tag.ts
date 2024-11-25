import * as pg from "drizzle-orm/pg-core";

export const tag = pg.pgTable("tag", {
  id: pg.serial().primaryKey(),
  name: pg.text(),
});
