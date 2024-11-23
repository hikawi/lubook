import bcrypt from "bcryptjs";
import mongoose, { Document } from "mongoose";

/*
A user has the following direct data.
- Username: the classic @username field.
- Email: the email for that user.
- Password: the password.
- Blocked authors: a list of user ids blocked.
- Blocked tags: a list of tags blocked.
*/

export interface IUser extends Document {
  username: string;
  password: string;
  email: string;
  admin: boolean;
  blocked: {
    authors: mongoose.Schema.Types.ObjectId[];
    tags: mongoose.Schema.Types.ObjectId[];
  };
}

const UserSchema = new mongoose.Schema<IUser>({
  username: {
    type: String,
    required: true,
    match: /^[\w]{2,32}$/,
    index: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, // Email regex
  },
  admin: {
    type: Boolean,
    default: false,
    required: true,
  },
  blocked: {
    authors: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    tags: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tag",
      },
    ],
  },
});

UserSchema.index({ username: 1 }, { unique: true, collation: { locale: "en", strength: 2 } });

// Add a hashing for the password saving.
UserSchema.pre("save", async function (this: IUser, next: any) {
  this.password = bcrypt.hashSync(this.password);
  next();
});

export { UserSchema };
export const User = mongoose.model("User", UserSchema);
