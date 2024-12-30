import { RequestHandler } from "express";
import expressAsyncHandler from "express-async-handler";
import { z } from "zod";
import { getProfile } from "../db/queries/profile.query";
import { AuthorizedRequest } from "../middlewares";
import { Status } from "../misc/status";

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
    const profile = await getProfile({ id: bearer.id });
    res.status(Status.OK).json(profile[0]);
  },
);

/**
 * GET /profile/:username: Retrieve someone's profile.
 *
 * - Clearance Level: 0 (Unclassified)
 * - Object Class: Safe
 * - Accepts: { username: string }
 * - Returns:
 *   - 200 (OK): An object with data similar above.
 *   - 404 (Not Found): That username can't be found.
 */
export const getProfileHandler: RequestHandler = expressAsyncHandler(
  async (req, res) => {
    const schema = z.object({
      username: z.string(),
    });
    const params = schema.parse(req.params);
    const profile = await getProfile({ username: params.username });

    if (profile.length == 0) {
      res
        .status(Status.NOT_FOUND)
        .json({ message: "That account can't be found" });
      return;
    }
    res.status(Status.OK).json(profile[0]);
  },
);
