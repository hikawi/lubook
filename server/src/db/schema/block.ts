import * as pg from "drizzle-orm/pg-core";
import { tags } from "./tag";
import { users } from "./user";

export const blockTags = pg.pgTable(
  "blocktags",
  {
    user: pg
      .serial("user_id")
      .references(() => users.id, { onDelete: "cascade" }),
    tag: pg.serial("tag_id").references(() => tags.id, { onDelete: "cascade" }),
  },
  (self) => ({
    pkUserBlockTag: pg.primaryKey({ columns: [self.user, self.tag] }),
  }),
);

export const blockUsers = pg.pgTable(
  "blockusers",
  {
    user: pg
      .serial("user_id")
      .references(() => users.id, { onDelete: "cascade" }),
    blocked: pg
      .serial("blocked_id")
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (self) => ({
    pkUserBlockUser: pg.primaryKey({ columns: [self.user, self.blocked] }),
  }),
);
