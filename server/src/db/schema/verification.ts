import * as pg from "drizzle-orm/pg-core";
import { users } from "./user";

const THREE_HOURS = 3 * 60 * 60 * 1000;

export const verifications = pg.pgTable("verification", {
  user: pg
    .serial("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .primaryKey(),
  token: pg.uuid().defaultRandom().unique().notNull(),
  exp: pg
    .timestamp()
    .$defaultFn(() => new Date(new Date().getTime() + THREE_HOURS))
    .notNull(),
});
