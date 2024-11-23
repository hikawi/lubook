import bcrypt, { compareSync } from "bcryptjs";
import { RequestHandler } from "express";
import expressAsyncHandler from "express-async-handler";
import { sign } from "jsonwebtoken";
import { z } from "zod";
import { Profile } from "../models/profile.model";
import { User } from "../models/user.model";

/**
 * POST /login: Attempts to login a user.
 *
 * - Clearance Level: 0 (Unclassified)
 * - Object Class: Safe
 * - Accepts: { username, email, password }.
 * - Returns:
 *   + 200 (Success): Logged in was success, returns a new web token.
 *   + 400 (Bad Request): The request was bad.
 *   + 401 (Unauthorized): The account exists, but passwords don't match.
 *   + 404 (Not Found): The request was good, but that account does not exist.
 */
export const login: RequestHandler = expressAsyncHandler(async (req, res) => {
  let result: z.SafeParseReturnType<
    {
      profile: string;
      password: string;
    },
    {
      profile: string;
      password: string;
    }
  >;

  if (/^[a-zA-Z][a-zA-Z0-9-_]{1,31}/.test(req.body.profile)) {
    // Okay, not an email.
    const schema = z.object({
      profile: z.string().regex(/^[a-zA-Z][a-zA-Z0-9-_]{1,31}/),
      password: z.string().min(1, "Can't be empty"),
    });
    result = schema.safeParse(req.body);
  } else {
    // Welp it's an email.
    const schema = z.object({
      profile: z.string().email(),
      password: z.string().min(1, "Can't be empty"),
    });
    result = schema.safeParse(req.body);
  }

  // Throw errors.
  if (result.error) {
    res.status(400);
    const err = result.error.errors[0];
    throw new Error(`${err.path}: ${err.message}`);
  }

  // Find the account.
  const account = await User.findOne({ $or: [{ username: result.data.profile }, { email: result.data.profile }] });

  // Oops, account not found.
  if (account == null) {
    res.status(404);
    throw new Error("Not found");
  }

  // Okay, account found, does password match?
  if (!compareSync(result.data.password, account.password)) {
    res.status(401);
    throw new Error("Wrong password");
  }

  // Okay, account found, password correct, welcome!
  const token = sign({ id: account.id }, process.env.JWT_SECRET!, { expiresIn: "7d" });
  res.status(200).json({ token });
});

/**
 * POST /register: Attempts to register a user.
 *
 * - Clearance Level: 0 (Unclassified)
 * - Object Class: Euclid
 * - Accepts: { name, username, email, password }.
 * - Returns:
 *   + 201 (Resource Created): A new user and profile has been created.
 *   + 400 (Bad Request): If the body request is malformed.
 *   + 409 (Conflict): If the account already existed.
 */
export const register: RequestHandler = expressAsyncHandler(async (req, res) => {
  const schema = z.object({
    name: z.string(),
    username: z.string().min(2, "Must have at least 2 characters.").max(32, "Must have at most 32 characters."),
    email: z.string().email("Must be in correct format"),
    password: z.string().min(1, "Password can't be empty"),
  });

  // Make sure request body is in the correct format.
  const result = schema.safeParse(req.body);
  if (!result.success) {
    res.status(400);
    const err = result.error.errors[0];
    throw new Error(`${err.path}: ${err.message}`);
  }

  // That means the parse was a success.
  const { username, password, email, name } = result.data;

  // Checks if the user exists.
  if (await User.exists({ $or: [{ username }, { email }] })) {
    res.status(409);
    throw new Error("There's already a user with that email or username");
  }

  // Create the user.
  const user = await User.create({ username, email, password: bcrypt.hashSync(password, 10) });
  const profile = await Profile.create({ username: user._id, name });

  res.status(201).json({
    id: user.id,
    username: user.username,
    email: user.email,
    password: user.password,
    name: profile.name,
  });
});
