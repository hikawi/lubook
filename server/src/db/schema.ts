import * as pg from "drizzle-orm/pg-core";
import { lower } from "./utils";

export const roles = pg.pgEnum("userrole", ["user", "moderator", "admin"]);

export const users = pg.pgTable(
  "user",
  {
    id: pg.serial().primaryKey(),
    username: pg.varchar({ length: 32 }).notNull().unique(),
    email: pg.text().notNull().unique(),
    password: pg.char({ length: 60 }).notNull(),
    role: roles().notNull(),
    joined: pg.timestamp().defaultNow().notNull(),
    verified: pg.boolean().notNull().default(false),
  },
  (self) => [{
    usernameIndex: pg.uniqueIndex("user_username_idx").on(lower(self.username)),
    emailIndex: pg.uniqueIndex("user_email_idx").on(lower(self.email)),
  }],
);

export const verifications = pg.pgTable("verification", {
  user: pg
    .serial()
    .primaryKey()
    .references(() => users.id),
  token: pg.text().notNull(), // The 6-digit code hashed with bcrypt to compare if they choose this route.
  urlToken: pg.text("url_token").notNull(), // The URL version of the token generated differently.
  created: pg.timestamp().notNull().defaultNow(),
});

export const tags = pg.pgTable("tag", {
  id: pg.serial().primaryKey(),
  name: pg.text(),
});

export const follows = pg.pgTable(
  "follow",
  {
    following: pg.serial().references(() => users.id, { onDelete: "cascade" }),
    followedBy: pg.serial().references(() => users.id, { onDelete: "cascade" }),
  },
  (self) => [{
    pkFollow: pg.primaryKey({ columns: [self.following, self.followedBy] }),
  }],
);

export const blockTags = pg.pgTable(
  "blocktags",
  {
    user: pg
      .serial("user_id")
      .references(() => users.id, { onDelete: "cascade" }),
    tag: pg.serial("tag_id").references(() => tags.id, { onDelete: "cascade" }),
  },
  (self) => [{
    pkUserBlockTag: pg.primaryKey({ columns: [self.user, self.tag] }),
  }],
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
  (self) => [{
    pkUserBlockUser: pg.primaryKey({ columns: [self.user, self.blocked] }),
  }],
);

export const profiles = pg.pgTable("profile", {
  id: pg.serial().primaryKey(),
  user: pg
    .serial("user_id")
    .unique()
    .references(() => users.id),
  name: pg.text(),
  bio: pg.text(),
  followers: pg.integer().notNull().default(0),
  followings: pg.integer().notNull().default(0),
  publications: pg.integer().notNull().default(0),
  chapters: pg.integer().notNull().default(0),
});

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

export const mangaCovers = pg.pgTable("mangacover", {
  manga: pg
    .serial()
    .references(() => mangas.id)
    .primaryKey(),
  fileName: pg.text("file_name"),
});

export const chapters = pg.pgTable(
  "chapter",
  {
    manga: pg
      .serial("manga_id")
      .notNull()
      .references(() => mangas.id),
    number: pg.integer().notNull().unique(),
    name: pg.text().notNull(),
    description: pg.text(),
    uploadDate: pg.timestamp("upload_date").defaultNow().notNull(),
    lastModifiedDate: pg.timestamp("last_modified_date").notNull().defaultNow(),
    disableComments: pg.boolean().notNull().default(true),
  },
  (self) => [{
    pkChapter: pg.primaryKey({ columns: [self.manga, self.number] }),
  }],
);

export const chapterCovers = pg.pgTable(
  "chaptercover",
  {
    manga: pg.serial(),
    chapter: pg.integer(),
    fileName: pg.text("file_name"),
  },
  (table) => [{
    chapterCoverPk: pg.primaryKey({ columns: [table.manga, table.chapter] }),
    chapterCoverFk: pg.foreignKey({
      columns: [table.manga, table.chapter],
      foreignColumns: [chapters.manga, chapters.number],
    }),
  }],
);

export const pages = pg.pgTable(
  "page",
  {
    manga: pg.serial().references(() => mangas.id),
    order: pg.integer(),
    fileName: pg.text("file_name").notNull(),
  },
  (self) => [{
    pagePk: pg.primaryKey({ columns: [self.manga, self.order] }),
  }],
);

export const authors = pg.pgTable(
  "author",
  {
    user: pg
      .serial()
      .references(() => users.id)
      .notNull(),
    manga: pg
      .serial()
      .references(() => mangas.id)
      .notNull(),
  },
  (self) => [{
    userMangaPk: pg.primaryKey({ columns: [self.user, self.manga] }),
  }],
);

export const ratings = pg.pgTable("rating", {
  user: pg.serial("user_id").references(() => users.id),
  manga: pg.serial("manga_id").references(() => mangas.id),
  rating: pg.real().notNull(),
  comment: pg.text(),
});

export const libraryEntries = pg.pgTable(
  "libraryentry",
  {
    user: pg
      .serial("user_id")
      .notNull()
      .references(() => users.id),
    manga: pg
      .serial("manga_id")
      .notNull()
      .references(() => mangas.id),
  },
  (self) => ({
    pkLibraryEntry: pg.primaryKey({ columns: [self.user, self.manga] }),
  }),
);

export const comments = pg.pgTable("comment", {
  id: pg.serial().primaryKey(),
  user: pg
    .serial("user_id")
    .references(() => users.id)
    .notNull(),
  manga: pg
    .serial("manga_id")
    .references(() => mangas.id, { onUpdate: "cascade" }),
  chapter: pg
    .integer("chapter_id")
    .references(() => chapters.number, { onUpdate: "cascade" }),
  time: pg.timestamp().notNull().defaultNow(),
  text: pg.text().notNull(),
});

export const replies = pg.pgTable("reply", {
  id: pg.serial().primaryKey(),
  comment: pg
    .serial("comment_id")
    .references(() => comments.id, { onDelete: "cascade" })
    .notNull(),
  user: pg
    .serial("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  text: pg.text().notNull(),
  time: pg.timestamp().notNull().defaultNow(),
});
