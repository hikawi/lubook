import * as pg from "drizzle-orm/pg-core";
import { tag } from "./tag";
import { user } from "./user";

export const blockTags = pg.pgTable("blocktags", {
  user: pg.serial("user_id").references(() => user.id),
  tag: pg.serial("tag_id").references(() => tag.id),
}, (self) => ({
  pkUserBlockTag: pg.primaryKey({ columns: [self.user, self.tag] });
}));
