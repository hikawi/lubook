import { RequestHandler } from "express";
import expressAsyncHandler from "express-async-handler";
import { z } from "zod";
import {
  blockTag,
  blockUser,
  getBlockedUsers,
  getBlockTags,
  isUserBlocked,
  unblockTag,
  unblockUser,
} from "../db/queries/block.query";
import { getTagId } from "../db/queries/tag.query";
import { findUser } from "../db/queries/user.query";
import { AuthorizedRequest } from "../middlewares";
import { Status } from "../misc/status";

/**
 * GET /block/users/:username: Checks if the user has blocked me.
 *
 * - Clearance Level: 1 (Confidential)
 * - Object Class: Safe
 * - Special Containment Procedures:
 *   - Accepts parameters { username: string }
 * - Returns:
 *   - 200 (OK): Returns { blocked: boolean }
 *   - 400 (Bad Request): Username is invalid
 *   - 404 (Not Found): That username can't be found
 */
export const isUserBlockedHandler: RequestHandler = expressAsyncHandler(
  async (req, res) => {
    const bearer = (req as AuthorizedRequest).bearer;
    const schema = z.object({ username: z.string().min(2) });
    const params = schema.safeParse(req.params);

    if (params.error) {
      res.status(Status.BAD_REQUEST).json({ message: "Invalid username" });
      return;
    }

    const user = await findUser({ username: params.data.username });
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
 * GET /block/users: Retrieves a list of blocked users.
 *
 * - Clearance Level: 1 (Confidential)
 * - Object Class: Safe
 * - Special Containment Procedures:
 *   - Accepts query { page: number, per_page: number }
 * - Returns:
 *   - 200 (OK): Returns { results: any[], page: number, total_pages: number }
 *   - 400 (Bad Request): If the query is invalid
 */
export const getBlockedUsersHandler: RequestHandler = expressAsyncHandler(
  async (req, res) => {
    const bearer = (req as AuthorizedRequest).bearer;
    const schema = z.object({
      page: z.coerce.number().int().safe().min(1).default(1),
      per_page: z.coerce.number().int().safe().min(1).max(100).default(20),
    });
    const query = schema.safeParse(req.query);

    if (query.error) {
      res
        .status(Status.BAD_REQUEST)
        .json({ message: query.error.issues[0].message });
      return;
    }

    const queryResult = await getBlockedUsers({
      user: bearer.id,
      ...query.data,
    });
    res.status(Status.OK).json(queryResult);
  },
);

/**
 * POST /block/users: Blocks a user.
 *
 * - Clearance Level: 1 (Confidential)
 * - Object Class: Euclid
 * - Special Containment Procedures:
 *   - Accepts body { username: string }
 * - Returns:
 *   - 200 (OK): Returns { blocker: string, blocked: string }
 *   - 400 (Bad Request): Username is invalid
 *   - 404 (Not Found): User is not found
 */
export const blockUserHandler: RequestHandler = expressAsyncHandler(
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
 * DELETE /block/users: Unblocks a user.
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
export const unblockUserHandler: RequestHandler = expressAsyncHandler(
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

/**
 * GET /block/tags: Retrieve a list of my blocked tags.
 *
 * - Clearance Level: 1 (Confidential)
 * - Object Class: Safe
 * - Special Containment Procedures:
 *   - Accepts query { page: number, per_page: number }, page defaults to 1, per_page defaults to 20.
 * - Addendum:
 *   - 200 (OK): Returns { results: any[], page: number, total_pages: number }
 *   - 400 (Bad Request): The request query is invalid
 */
export const getBlockTagsHandler: RequestHandler = expressAsyncHandler(
  async (req, res) => {
    const schema = z.object({
      page: z.coerce.number().min(1).safe().int().default(1),
      per_page: z.coerce.number().min(1).max(100).safe().int().default(20),
    });
    const query = schema.safeParse(req.query);
    const bearer = (req as AuthorizedRequest).bearer;

    if (query.error) {
      res
        .status(Status.BAD_REQUEST)
        .json({ message: "Invalid query parameters." });
      return;
    }

    const blockedTags = await getBlockTags({ user: bearer.id, ...query.data });
    res.status(Status.OK).json(blockedTags);
  },
);

/**
 * POST /block/tags: Block a tag.
 *
 * - Clearance Level: 1 (Confidential)
 * - Object Class: Euclid
 * - Special Containment Procedures:
 *   - Accepts body { name: string }
 * - Addendum:
 *   - 200 (OK): You already blocked the tag.
 *   - 201 (Created): You blocked the tag.
 *   - 400 (Bad Request): The body was invalid.
 *   - 404 (Not Found): That tag doesn't exist.
 */
export const blockTagHandler: RequestHandler = expressAsyncHandler(
  async (req, res) => {
    const schema = z.object({
      name: z.string(),
    });
    const body = schema.safeParse(req.body);
    const bearer = (req as AuthorizedRequest).bearer;

    if (body.error) {
      res.status(Status.BAD_REQUEST).json({ message: "Invalid body." });
      return;
    }

    const tag = await getTagId(body.data.name);
    if (tag == -1) {
      res
        .status(Status.NOT_FOUND)
        .json({ message: "That tag doesn't exist", tag: body.data.name });
      return;
    }

    const results = await blockTag(bearer.id, tag);
    if (results == 0) {
      res.status(Status.OK).json({ message: "Already blocked" });
    } else {
      res.status(Status.CREATED).json({ message: "Blocked tag" });
    }
  },
);

/**
 * DELETE /block/tags: Unblock a tag.
 *
 * - Clearance Level: 1 (Confidential)
 * - Object Class: Euclid
 * - Special Containment Procedures:
 *   - Accepts body { name: string }
 * - Addendum:
 *   - 200 (OK): Unblock successfully
 *   - 400 (Bad Request): Incorrect body format
 *   - 404 (Not Found): The tag can not be found
 */
export const unblockTagHandler: RequestHandler = expressAsyncHandler(
  async (req, res) => {
    const schema = z.object({
      name: z.string(),
    });
    const body = schema.safeParse(req.body);
    const bearer = (req as AuthorizedRequest).bearer;

    if (body.error) {
      res.status(Status.BAD_REQUEST).json({ message: "Invalid body" });
      return;
    }

    const tag = await getTagId(body.data.name);
    if (tag == -1) {
      res
        .status(Status.NOT_FOUND)
        .json({ message: "That tag can't be found", name: body.data.name });
      return;
    }

    await unblockTag(bearer.id, tag);
    res
      .status(Status.OK)
      .json({ message: "Unblocked tag", name: body.data.name });
  },
);
