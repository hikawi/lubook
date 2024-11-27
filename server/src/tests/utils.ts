import { db } from "../db";
import { blockTags, blockUsers } from "../db/schema/block";
import { chapters } from "../db/schema/chapter";
import { comments } from "../db/schema/comment";
import { follows } from "../db/schema/follow";
import { libraryEntries } from "../db/schema/library";
import { mangas } from "../db/schema/manga";
import { profiles } from "../db/schema/profile";
import { ratings } from "../db/schema/rating";
import { replies } from "../db/schema/reply";
import { tags } from "../db/schema/tag";
import { users } from "../db/schema/user";

export async function clearDatabase() {
  const promises = [
    blockTags,
    blockUsers,
    chapters,
    comments,
    follows,
    libraryEntries,
    mangas,
    profiles,
    ratings,
    replies,
    tags,
    users,
  ].map((e) => db.delete(e));
  await Promise.all(promises);
}
