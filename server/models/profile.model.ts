import mongoose from "mongoose";

/**
 * The schema model for the User model.
 * This includes things to display on a profile:
 * - The display name (this can be anything, instead of just ASCII like a username.)
 * - The biography
 * - Cached counts (publications, chapters, followers, and followings).
 */

export const ProfileSchema = new mongoose.Schema({
  username: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  name: {
    type: String,
    minLength: 1,
  },
  biography: {
    type: String,
    maxLength: 256,
  },
  publication_count: {
    type: Number,
    min: 0,
    default: 0,
  },
  chapter_count: {
    type: Number,
    min: 0,
    default: 0,
  },
  follower_count: {
    type: Number,
    min: 0,
    default: 0,
  },
  following_count: {
    type: Number,
    min: 0,
    default: 0,
  },
});

export const Profile = mongoose.model("Profile", ProfileSchema);
