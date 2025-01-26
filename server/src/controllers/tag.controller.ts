import { RequestHandler } from "express";
import expressAsyncHandler from "express-async-handler";
import { z } from "zod";
import { getTags } from "../db/queries/tag.query";
import { Status } from "../misc/status";

/**
 * GET /tags: Retrieves all tags.
 *
 * - Clearance Level: 0 (Unclassified)
 * - Object Class: Safe
 * - Special Containment Procedures:
 *   - Accepts query { page, per_page }
 * - Addendum:
 *   - 200 (OK): Returns { results, total, total_pages }
 *   - 400 (Bad Request): Query was invalid
 */
export const getTagsHandler: RequestHandler = expressAsyncHandler(
  async (req, res) => {
    const schema = z.object({
      page: z.coerce.number().int().safe().min(1).default(1),
      per_page: z.coerce.number().int().safe().min(1).max(100).default(20),
    });
    const query = schema.safeParse(req.query);

    if (query.error) {
      res.status(Status.BAD_REQUEST).json({ message: "Bad query request" });
      return;
    }

    const results = await getTags(query.data);
    res.status(Status.OK).json(results);
  },
);
