import { RequestHandler } from "express";
import expressAsyncHandler from "express-async-handler";
import { z } from "zod";
import { findUser } from "../db/queries/user.query";
import { AuthorizedRequest } from "../middlewares";

/**
 * POST /follow: Requests a follow relationship to be created.
 *
 * - Clearance Level: 1 (Confidential)
 * - Object Class: Euclid (Creating follow cascades into Profile.followings, Profile.followers)
 * - Accepts: { username: string }
 * - Returns:
 *   - 200 (OK): Already following.
 *   - 201 (Created): Now following! Responses { follower: string, following: string }.
 *   - 400 (Bad Request): The request body is invalid.
 *   - 403 (Forbidden): The follower is blocked by the followed.
 *   - 404 (Not Found): The user can not be found.
 */
export const follow: RequestHandler = expressAsyncHandler(async (req, res) => {
  const bearer = (req as AuthorizedRequest).bearer;
  const schema = z.object({ username: z.string().min(1) });
  const body = schema.safeParse(req.body);

  if (body.error) {
    res.status(400);
    throw new Error("Username is invalid");
  }

  const followed = await findUser({ username: body.data.username });
  if (followed.length == 0) {
    res.status(404);
    throw new Error("That user does not exist");
  }
});
