/*
A tag is like a genre category. A tag should have a name that is unique, and that's it.
*/

import mongoose from "mongoose";

const TagSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
  },
});
TagSchema.index({ name: 1 }, { unique: true, collation: { locale: "en", strength: 2 } });

export { TagSchema };
export const Tag = mongoose.model("Tag", TagSchema);
