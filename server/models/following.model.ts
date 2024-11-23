import mongoose, { Document } from "mongoose";
import { Profile } from "./profile.model";

/*
The following Schema, has:
- A follower ID.
- A followed ID.
*/

export interface IFollowing extends Document {
  followed: mongoose.Schema.Types.ObjectId;
  follower: mongoose.Schema.Types.ObjectId;
}

const FollowingSchema = new mongoose.Schema<IFollowing>({
  followed: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  follower: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

// Add a post save, to increase a user's profile following and followers.
// Save is called when a new following relationship is added.
FollowingSchema.post("save", async function (this: IFollowing) {
  await Profile.updateOne({ username: this.followed }, { $inc: { follower_count: 1 } });
  await Profile.updateOne({ username: this.follower }, { $inc: { following_count: 1 } });
});

FollowingSchema.post("findOneAndDelete", async function (doc: IFollowing) {
  await Profile.updateOne({ username: doc.followed }, { $inc: { follower_count: -1 } });
  await Profile.updateOne({ username: doc.follower }, { $inc: { following_count: -1 } });
});

// Stop normal delete functions.
FollowingSchema.pre(/^delete/, async function (this: IFollowing, next: any) {
  next(new Error("Please use find and delete to make sure following is updated."));
});

export { FollowingSchema };
export const Following = mongoose.model("Following", FollowingSchema);
