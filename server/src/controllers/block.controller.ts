import { RequestHandler } from "express";
import expressAsyncHandler from "express-async-handler";
import { z } from "zod";
import {
  blockUser,
  getBlockList,
  isUserBlocked,
  unblockUser,
} from "../db/queries/block.query";
import { findUser } from "../db/queries/user.query";
import { AuthorizedRequest } from "../middlewares";
import { Status } from "../misc/status";

/**
 * GET /block?username: Checks if a user has blocked me.
 *
 * - Clearance Level: 1 (Confidential)
 * - Object Class: Safe
 * - Special Containment Procedures:
 *   - Accepts query { username: string }
 * - Returns:
 *   - 200 (OK): { blocked: boolean }
 *   - 400 (Bad Request): Username field is malformed.
 *   - 404 (Not Found): That username can't be found.
 */
export const isBlockedHandler: RequestHandler = expressAsyncHandler(
  async (req, res) => {
    const bearer = (req as AuthorizedRequest).bearer;
    const schema = z.object({ username: z.string().min(2) });
    const parsed = schema.safeParse(req.query);

    if (parsed.error) {
      res
        .status(Status.BAD_REQUEST)
        .json({ message: "The username field is invalid" });
      return;
    }

    const user = await findUser({ username: parsed.data.username });
    if (user.length == 0) {
      res
        .status(Status.NOT_FOUND)
        .json({ message: "That username doesn't exist" });
      return;
    }

    const result = await isUserBlocked(user[0].id, bearer.id);
    res.status(Status.OK).json({ blocked: result });
  },
);

/**
 * GET /block/list?page&per_page: Retrieves your block list.
 *
 * - Clearance Level: 1 (Confidential)
 * - Object Class: Safe
 * - Special Containment Procedures:
 *   - Accepts query { page: number, per_page: number }
 * - Returns:
 *   - 200 (OK): returns a list of usernames of that page.
 *   - 400 (Bad Request): unknown queries.
 */
export const blocklistHandler: RequestHandler = expressAsyncHandler(
  async (req, res) => {
    const bearer = (req as AuthorizedRequest).bearer;
    const schema = z.object({
      page: z.coerce.number().int().safe().min(1).default(1),
      per_page: z.coerce.number().int().safe().min(1).max(100).default(20),
    });
    const parsed = schema.safeParse(req.query);

    if (parsed.error) {
      res
        .status(Status.BAD_REQUEST)
        .json({ message: parsed.error.issues[0].message });
      return;
    }

    const queryResult = await getBlockList({ user: bearer.id, ...parsed.data });
    res.status(Status.OK).json(queryResult);
  },
);

/**
 * POST /block: Blocks a username.
 *
 * - Clearance Level: 1 (Confidential)
 * - Object Class: Euclid
 * - Special Containment Procedures: { username: string }
 * - Returns:
 *   - 200 (OK): Already blocked.
 *   - 201 (Created): Blocked successfully.
 *   - 400 (Bad Request): Username field is invalid.
 *   - 404 (Not Found): Username can't be found.
 */
export const blockHandler: RequestHandler = expressAsyncHandler(
  async (req, res) => {
    const bearer = (req as AuthorizedRequest).bearer;
    const schema = z.object({ username: z.string().min(2) });
    const parsed = schema.safeParse(req.body);

    if (parsed.error) {
      res
        .status(Status.BAD_REQUEST)
        .json({ message: "Username field is invalid" });
      return;
    }

    const blocked = await findUser({ username: parsed.data.username });
    if (blocked.length == 0) {
      res
        .status(Status.NOT_FOUND)
        .json({ message: "That username doesn't exist." });
      return;
    }

    const rowCount = await blockUser(bearer.id, blocked[0].id);
    if (rowCount == 0) {
      res
        .status(Status.OK)
        .json({ message: "You have already blocked that user." });
    } else {
      res.status(Status.CREATED).json({ blocked: blocked[0].username });
    }
  },
);

/**
 * DELETE /block: Unblocks a user.
 *
 * - Clearance Level: 1 (Confidential)
 * - Object Class: Euclid
 * - Special Containment Procedures:
 *   - Accepts { username: string }, the name to block
 * - Addendum:
 *   - 200: Unblock was successful.
 *   - 204: There was no block in the first place.
 *   - 400: Bad schema.
 *   - 404: The username is not found.
 */
export const unblockHandler: RequestHandler = expressAsyncHandler(
  async (req, res) => {
    const schema = z.object({
      username: z.string().min(2),
    });
    const bearer = (req as AuthorizedRequest).bearer;
    const body = schema.safeParse(req.body);

    if (body.error) {
      res.status(Status.BAD_REQUEST).json({ message: "Username is invalid" });
      return;
    }

    const unblocking = await findUser({ username: body.data.username });
    if (unblocking.length == 0) {
      res
        .status(Status.NOT_FOUND)
        .json({ message: "That username does not exist" });
      return;
    }

    const result = await unblockUser(bearer.id, unblocking[0].id);
    if (result == 0) {
      res
        .status(Status.NO_CONTENT)
        .json({ message: "That user is not blocked in the first place" });
    } else {
      res.status(Status.OK).json({ blocked: body.data.username });
    }
  },
);
