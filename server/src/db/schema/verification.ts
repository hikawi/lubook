import * as pg from "drizzle-orm/pg-core";
import { users } from "./user";

export const verifications = pg.pgTable("verification", {
  user: pg
    .serial()
    .primaryKey()
    .references(() => users.id),
  token: pg.text().notNull(), // The 6-digit code hashed with bcrypt to compare if they choose this route.
  urlToken: pg.text("url_token").notNull(), // The URL version of the token generated differently.
  created: pg.timestamp().notNull().defaultNow(),
});
