import * as pg from "drizzle-orm/pg-core";
import { users } from "./user";

const FIFTEEN_MINS = 15 * 60 * 1000;

export const verifications = pg.pgTable("verification", {
  user: pg.serial().primaryKey().references(() => users.id),
  token: pg.text(),
  expiry: pg.timestamp().$defaultFn(() => new Date(new Date().getTime() + FIFTEEN_MINS)),
});
