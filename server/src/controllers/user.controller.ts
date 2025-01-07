import { compareSync } from "bcryptjs";
import { RequestHandler } from "express";
import expressAsyncHandler from "express-async-handler";
import { sign } from "jsonwebtoken";
import { z } from "zod";
import {
  createUser,
  existsUser,
  findUser,
  updateUserAccount,
} from "../db/queries/user.query";
import { generateVerification, isVerified } from "../db/queries/verify.query";
import { AuthorizedRequest } from "../middlewares";
import { Status } from "../misc/status";

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
    const schema = z.object({
      profile: z.union([
        z.string().regex(/^[A-Za-z-_]{2,32}$/),
        z.string().email(),
      ]),
      password: z.string().min(1, "Can't be empty"),
    });
    const result = schema.safeParse(req.body);

    // Throw errors.
    if (result.error) {
      res.status(Status.BAD_REQUEST);
      const err = result.error.errors[0];
      res.json({ message: `${err.path}: ${err.message}` });
      return;
    }

    // Check if that account exists.
    const user = await findUser({
      username: result.data.profile,
      email: result.data.profile,
    });
    if (user.length == 0) {
      res.status(Status.NOT_FOUND).json({ message: "No account exists" });
      return;
    }

    // Check if passwords match.
    if (!compareSync(result.data.password, user[0].password)) {
      res.status(Status.UNAUTHORIZED).json({ message: "Incorrect password" });
      return;
    }

    // Check if they are verified.
    if (!(await isVerified(result.data.profile))) {
      res.status(Status.FORBIDDEN).json({ message: "User isn't verified" });
      return;
    }

    // Login success. Sign with the static data id.
    const token = sign({ id: user[0].id }, process.env.JWT_SECRET!, {
      expiresIn: "24h",
    });

    // Sets the cookie with the token.
    res
      .status(200)
      .cookie("authorization", token, {
        httpOnly: true,
        secure: req.secure,
        sameSite: "none",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .json({ success: true });
  },
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
        .regex(/^[A-Za-z-_]{2,32}$/),
      email: z.string().email("Must be a valid email"),
      password: z.string().min(1, "Password can't be empty"),
    });

    // Make sure request body is in the correct format.
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const err = result.error.errors[0];
      res
        .status(Status.BAD_REQUEST)
        .json({ message: `${err.path}: ${err.message}` });
      return;
    }

    // Checks if the user exists.
    if (
      await existsUser({
        username: result.data.username,
        email: result.data.email,
      })
    ) {
      res.status(409).json({ message: "That user already exists." });
      return;
    }

    // Create the user.
    const user = await createUser({ ...result.data });
    generateVerification(user.username);
    res.status(201).json(user);
  },
);

/**
 * POST /users: Update a user account from the user's POV.
 *
 * - Clearance Level: 1 (Confidential)
 * - Object Class: Euclid
 * - Special Containment Procedures:
 *   + Body { username: string, email: string, password: string }.
 *   + This is a request from the user to update, not an admin updating an account.
 * - Addendum:
 *   + 200 (OK)
 *   + 400 (Bad Request): Did not fit schema
 *   + 403 (Forbidden): Wrong password
 *   + 409 (Conflict): Username or email is taken. See "path" property on return object.
 */
export const updateUserHandler: RequestHandler = expressAsyncHandler(
  async (req, res) => {
    const schema = z.object({
      username: z.string(),
      email: z.string(),
      password: z.string(),
    });
    const bearer = (req as AuthorizedRequest).bearer;
    const body = schema.safeParse(req.body);

    if (body.error) {
      res.status(Status.BAD_REQUEST).json({
        message: body.error.issues[0].message,
        path: body.error.issues[0].path,
      });
      return;
    }

    // Attempting to find by username.
    const usernameQuery = await findUser({ username: body.data.username });
    if (usernameQuery.length > 0 && usernameQuery[0].id != bearer.id) {
      res
        .status(Status.CONFLICT)
        .json({ message: "Conflict", path: "username" });
      return;
    }

    // Attempting to find by email.
    const emailQuery = await findUser({ email: body.data.email });
    if (emailQuery.length > 0 && emailQuery[0].id != bearer.id) {
      res.status(Status.CONFLICT).json({ message: "Conflict", path: "email" });
      return;
    }

    // Check the password
    const user = usernameQuery[0];
    if (!compareSync(body.data.password, user.password)) {
      res.status(Status.FORBIDDEN).json({ message: "Wrong password" });
      return;
    }

    const result = await updateUserAccount(bearer.id, body.data);
    res.status(Status.OK).json(result);
  },
);

/**
 * POST /api/logout: Logout and invalidate the cookie token.
 *
 * - Clearance Level: 0 (Unclassified)
 * - Object Class: Safe
 * - Accepts: none
 * - Returns:
 *   - 204 (No Content): The cookie was cleared.
 */
export const logoutHandler: RequestHandler = expressAsyncHandler(
  async (req, res) => {
    res.clearCookie("authorization");
    res.status(204).send();
  },
);
