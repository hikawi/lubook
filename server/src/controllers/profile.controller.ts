import { RequestHandler } from "express";
import expressAsyncHandler from "express-async-handler";
import { getProfile } from "../db/queries/profile.query";
import { AuthorizedRequest } from "../middlewares";

/**
 * GET /profile: Retrieve my own profile
 *
 * - Clearance Level: 1 (Confidential)
 * - Object Class: Safe
 * - Accepts: nothing
 * - Returns:
 *   - 200 (OK): An object with username, name, email, bio, followerCount, followingCount, etc.
 *   - 401 (Unauthorized): Auth middleware will block
 */
export const getMeHandler: RequestHandler = expressAsyncHandler(
  async (req, res) => {
    const bearer = (req as AuthorizedRequest).bearer;
    const profile = await getProfile(bearer.id);
    res.status(200).json(profile[0]);
  },
);
