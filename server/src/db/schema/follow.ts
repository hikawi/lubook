import * as pg from "drizzle-orm/pg-core";
import { user } from "./user";

export const follow = pg.pgTable(
  "follow",
  {
    following: pg.serial().references(() => user.id),
    followedBy: pg.serial().references(() => user.id),
  },
  (self) => ({
    pkFollow: pg.primaryKey({ columns: [self.following, self.followedBy] }),
  })
);
