import * as pg from "drizzle-orm/pg-core";
import { users } from "./user";

export const follows = pg.pgTable(
  "follow",
  {
    following: pg.serial().references(() => users.id, { onDelete: "cascade" }),
    followedBy: pg.serial().references(() => users.id, { onDelete: "cascade" }),
  },
  (self) => ({
    pkFollow: pg.primaryKey({ columns: [self.following, self.followedBy] }),
  })
);
