import { RequestHandler } from "express";
import expressAsyncHandler from "express-async-handler";
import { z } from "zod";
import {
  blockUser,
  getBlockList,
  isUserBlocked,
} from "../db/queries/block.query";
import { findUser } from "../db/queries/user.query";
import { AuthorizedRequest } from "../middlewares";

/**
 * GET /block/check/:username: Checks if a user has blocked me.
 *
 * - Clearance Level: 1 (Confidential)
 * - Object Class: Safe
 * - Returns:
 *   - 200 (OK): { blocked: boolean }
 *   - 400 (Bad Request): Username field is malformed.
 *   - 404 (Not Found): That username can't be found.
 */
export const isBlockedHandler: RequestHandler = expressAsyncHandler(
  async (req, res) => {
    const bearer = (req as AuthorizedRequest).bearer;
    const schema = z.object({ username: z.string().min(2) });
    const parsed = schema.safeParse(req.params);

    if (parsed.error) {
      res.status(400);
      throw new Error("The username field is invalid.");
    }

    const user = await findUser(parsed.data.username);
    if (user.length == 0) {
      res.status(404);
      throw new Error(parsed.data.username + " doesn't exist.");
    }

    const result = await isUserBlocked(user[0].id, bearer.id);
    res.status(200).json({ blocked: result });
  }
);

/**
 * GET /block/list?page&per_page: Retrieves your block list.
 *
 * - Clearance Level: 1 (Confidential)
 * - Object Class: Safe
 * - Returns:
 *   - 200 (OK): returns a list of usernames of that page.
 *   - 400 (Bad Request): unknown queries.
 */
export const blocklistHandler: RequestHandler = expressAsyncHandler(
  async (req, res) => {
    const bearer = (req as AuthorizedRequest).bearer;
    const schema = z.object({
      page: z.number().int().safe().min(1),
      per_page: z.number().int().safe().min(1).max(100),
    });
    const parsed = schema.safeParse({
      page: Number(req.query.page || 1),
      per_page: Number(req.query.per_page || 20),
    });

    if (parsed.error) {
      res.status(400);
      throw new Error("Invalid query");
    }

    const queryResult = getBlockList(
      bearer.id,
      parsed.data.page,
      parsed.data.per_page
    );
    res.status(200).json({ result: queryResult });
  }
);

/**
 * POST /block: Blocks a username.
 *
 * - Clearance Level: 1 (Confidential)
 * - Object Class: Euclid
 * - Accepts: { username }
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
      res.status(400);
      throw new Error("Username field invalid");
    }

    const blocked = await findUser(parsed.data.username);
    if (blocked.length == 0) {
      res.status(404);
      throw new Error("That username doesn't exist");
    }

    const rowCount = await blockUser(bearer.id, blocked[0].id);
    if (rowCount == 0) {
      res.status(200);
      res.json({ message: "Double-blocking isn't necessary." });
    } else {
      res.status(201);
      res.json({ blocked: blocked[0].username });
    }
  }
);
