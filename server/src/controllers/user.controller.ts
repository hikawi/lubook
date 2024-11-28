import { compareSync } from "bcryptjs";
import { RequestHandler } from "express";
import expressAsyncHandler from "express-async-handler";
import { sign } from "jsonwebtoken";
import { z } from "zod";
import { createUser, existsUser, findUser } from "../db/queries/user.query";

/**
 * POST /login: Attempts to login a user.
 *
 * - Clearance Level: 0 (Unclassified)
 * - Object Class: Safe
 * - Accepts: { profile, password }.
 * - Returns:
 *   + 200 (Success): Logged in was success, returns a new web token.
 *   + 400 (Bad Request): The request was bad.
 *   + 401 (Unauthorized): The account exists, but passwords don't match.
 *   + 404 (Not Found): The request was good, but that account does not exist.
 */
export const loginHandler: RequestHandler = expressAsyncHandler(
  async (req, res) => {
    type LoginBody = { profile: string; password: string };
    let result: z.SafeParseReturnType<LoginBody, LoginBody>;

    if (/^[a-zA-Z][a-zA-Z0-9-_]{1,31}$/.test(req.body.profile)) {
      // Okay, not an email.
      const schema = z.object({
        profile: z.string().regex(/^[a-zA-Z][a-zA-Z0-9-_]{1,31}$/),
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

    // Check if that account exists.
    const profile = result.data.profile;
    const user = await findUser({ username: profile, email: profile });
    if (user.length == 0) {
      res.status(404);
      throw new Error("No account exists");
    }

    // Check if passwords match.
    if (!compareSync(result.data.password, user[0].password)) {
      res.status(401);
      throw new Error("Incorrect password");
    }

    // Login success. Sign with the static data id.
    const token = sign({ id: user[0].id }, process.env.JWT_SECRET!, {
      expiresIn: "24h",
    });
    res.status(200).json({ token });
  }
);

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
export const registerHandler: RequestHandler = expressAsyncHandler(
  async (req, res) => {
    const schema = z.object({
      name: z.string().optional(),
      username: z
        .string()
        .min(2, "Must have at least 2 characters.")
        .max(32, "Must have at most 32 characters.")
        .regex(/^[a-zA-Z][a-zA-Z0-9-_]{1,31}$/),
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
    const { username, email } = result.data;

    // Checks if the user exists.
    if (await existsUser({ username, email })) {
      res.status(409);
      throw new Error("There's already a user with that email or username");
    }

    // Create the user.
    const user = await createUser({ ...result.data });
    res.status(201).json(user);
  }
);
