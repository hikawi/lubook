import { RequestHandler } from "express";
import expressAsyncHandler from "express-async-handler";
import { z } from "zod";
import {
  createTag,
  deleteTag,
  editTag,
  getTagId,
  getTags,
  isTagTaken,
} from "../db/queries/tag.query";
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

/**
 * POST /tags: Create a new tag
 *
 * - Clearance Level: 3 (Secret)
 * - Object Class: Euclid
 * - Special Containment Procedures:
 *   - Accepts body { name: string }
 * - Addendum:
 *   - 201 (Created): A new tag has been created
 *   - 400 (Bad Request): Invalid request body
 *   - 409 (Conflict): That tag name already exists
 */
export const createTagHandler: RequestHandler = expressAsyncHandler(
  async (req, res) => {
    const schema = z.object({
      name: z.string().regex(/[A-Za-z\s\-_]+/),
    });
    const body = schema.safeParse(req.body);

    if (body.error) {
      res.status(Status.BAD_REQUEST).json({ message: "Invalid request body" });
      return;
    }

    if (await isTagTaken(body.data.name)) {
      res.status(Status.CONFLICT).json({ message: "Tag name already taken" });
      return;
    }

    const results = await createTag(body.data.name);
    res.status(Status.CREATED).json(results[0]);
  },
);

/**
 * PUT /tags: Edit a tag.
 *
 * - Clearance Level: 3 (Secret)
 * - Object Class: Euclid
 * - Special Containment Procedures:
 *   - Accepts body { id: number, name: string }
 * - Addendum:
 *   - 200 (OK): It was changed
 *   - 400 (Bad Request): Invalid request body
 *   - 404 (Not Found): ID not found
 *   - 409 (Conflict): Name was already taken
 */
export const editTagHandler: RequestHandler = expressAsyncHandler(
  async (req, res) => {
    const schema = z.object({
      id: z.coerce.number().nonnegative().int(),
      name: z.string().regex(/[A-Za-z\-_\s]/),
    });
    const body = schema.safeParse(req.body);

    if (body.error) {
      res.status(Status.BAD_REQUEST).json({ message: "Invalid request body" });
      return;
    }

    const otherId = await getTagId(body.data.name);
    if (otherId != -1 && otherId != body.data.id) {
      res
        .status(Status.CONFLICT)
        .json({ message: "Tag name taken", ...body.data });
      return;
    }

    const queryResults = await editTag(body.data.id, body.data.name);
    if (queryResults.length == 0) {
      res.status(Status.NOT_FOUND).json({ message: "That ID can't be found" });
      return;
    } else {
      res.status(Status.OK).json({ message: "Success", tag: queryResults[0] });
      return;
    }
  },
);

/**
 * DELETE /tags: Delete a tag
 *
 * - Clearance Level: 3 (Secret)
 * - Object Class: Keter
 * - Special Containment Procedures:
 *   - Accepts { id: number } to delete
 *   - This will cascade onto tags specified on mangas
 * - Addendum:
 *   - 200 (OK): The tag was deleted
 *   - 400 (Bad Request): Invalid request body
 *   - 404 (Not Found): That tag can't be found
 */
export const deleteTagHandler: RequestHandler = expressAsyncHandler(
  async (req, res) => {
    const schema = z.object({
      id: z.coerce.number().nonnegative().int().safe(),
    });
    const body = schema.safeParse(req.body);

    if (body.error) {
      res.status(Status.BAD_REQUEST).json({ message: "Invalid id" });
      return;
    }

    const queryResult = await deleteTag(body.data.id);
    if (queryResult.length == 0) {
      res
        .status(Status.NOT_FOUND)
        .json({ message: "Unknown tag", id: body.data.id });
    } else {
      res.status(Status.OK).json(queryResult[0]);
    }
  },
);
