import { RequestHandler } from "express";
import expressAsyncHandler from "express-async-handler";
import fileUpload from "express-fileupload";
import sharp from "sharp";
import { z } from "zod";
import {
  deleteAvatar,
  getProfile,
  updateAvatar,
  updateProfile,
} from "../db/queries/profile.query";
import { deleteAvatarObject, uploadAvatar } from "../db/queries/s3.query";
import { AuthorizedRequest, SoftAuthorizedRequest } from "../middlewares";
import { Status } from "../misc/status";

/**
 * GET /profile: Retrieve a profile.
 *
 * - Clearance Level: 0 (Unclassified)
 * - Object Class: Safe
 * - Accepts:
 *   - Query { username?: string }
 * - Returns:
 *   - 200 (OK): An object with username, name, email, bio, followerCount, followingCount, etc.
 *   - 401 (Unauthorized): If trying to check self, and not authorized.
 */
export const getProfileHandler: RequestHandler = expressAsyncHandler(
  async (req, res) => {
    const schema = z.object({
      username: z.string().min(2).optional(),
    });
    const query = schema.safeParse(req.query);
    const bearer = (req as SoftAuthorizedRequest).bearer;

    if (query.error) {
      res.status(Status.BAD_REQUEST).json({ message: "Bad request" });
      return;
    }

    if (!query.data.username && !bearer?.id) {
      res.status(Status.UNAUTHORIZED).json({
        message: "You can't lookup your own profile if not authorized.",
      });
      return;
    }

    // Retrieves the other user's profile instead.
    if (query.data.username) {
      const profile = await getProfile({ username: query.data.username });
      if (profile.length == 0) {
        res.status(Status.NOT_FOUND).json({
          message: "That username can't be found",
          username: query.data.username,
        });
        return;
      }

      res
        .status(Status.OK)
        .json({ ...profile[0], self: profile[0].id == bearer?.id });
      return;
    }

    // Retrieves my profile.
    const profile = await getProfile({ id: bearer!.id });
    res.status(Status.OK).json({ ...profile[0], self: true });
  },
);

/**
 * PUT /profile: Updates a profile's information.
 *
 * - Clearance Level: 1 (Confidential)
 * - Object Class: Euclid
 * - Special Containment Procedures:
 *   + This accepts body { penName, username, biography }.
 * - Addendum:
 *   + 200 (OK): Profile was updated successfully.
 *   + 400 (Bad Request): The username is incorrectly formatted.
 *   + 409 (Conflict): Username is taken.
 */
export const updateProfileHandler: RequestHandler = expressAsyncHandler(
  async (req, res) => {
    const schema = z.object({
      penName: z.string().optional(),
      username: z
        .string()
        .min(2)
        .max(32)
        .regex(/[a-zA-Z][a-zA-Z0-9-_]{1,31}/),
      biography: z.string().optional(),
    });
    const body = schema.safeParse(req.body);
    const bearer = (req as AuthorizedRequest).bearer;

    if (body.error) {
      res.status(Status.BAD_REQUEST).json({ message: "Bad username" });
      return;
    }

    const userProfile = await getProfile({ username: body.data.username });
    if (userProfile.length > 0 && userProfile[0].id != bearer.id) {
      res
        .status(Status.CONFLICT)
        .json({ message: "Conflict", username: body.data.username });
      return;
    }

    await updateProfile({ id: bearer.id, ...body.data });
    res.status(Status.OK).json({ message: "Updated", ...body.data });
  },
);

/**
 * POST /profile/avatar: Updates a profile's avatar.
 *
 * - Clearance Level: 1 (Confidential)
 * - Object Class: Euclid
 * - Special Containment Procedures:
 *   + This is a file upload route. This accepts a single image file.
 * - Addendum:
 *   + 200 (OK): If the image is uploaded to S3 correctly.
 *   + 400 (Bad Request): The provided file is not an image.
 */
export const updateAvatarHandler: RequestHandler = expressAsyncHandler(
  async (req, res) => {
    const bearer = (req as AuthorizedRequest).bearer;
    if (!req.files) {
      res.status(Status.BAD_REQUEST).json({ message: "Malformed image" });
      return;
    }

    const file = req.files.file as fileUpload.UploadedFile;
    const allowedImages = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/avif",
      "image/heif",
      "image/heic",
    ];

    if (!allowedImages.includes(file.mimetype)) {
      res
        .status(Status.BAD_REQUEST)
        .json({ message: "Unsupported image type", supported: allowedImages });
      return;
    }

    const transformed = await sharp(file.data)
      .webp()
      .resize({ width: 256 })
      .toBuffer();

    await uploadAvatar(bearer.id, transformed);
    await updateAvatar({
      id: bearer.id,
      url: `${process.env.S3_BASE}/avatars/${bearer.id}`,
    });

    res
      .status(Status.CREATED)
      .json({ location: `${process.env.S3_BASE}/avatars/${bearer.id}` });
  },
);

/**
 * DELETE /profile/avatar: Deletes an avatar and resets to default.
 *
 * - Clearance Level: 1 (Confidential)
 * - Object Class: Euclid
 * - Addendum:
 *   + 200 (OK): Image deleted successfully.
 */
export const deleteAvatarHandler: RequestHandler = expressAsyncHandler(
  async (req, res) => {
    const bearer = (req as AuthorizedRequest).bearer;
    await deleteAvatar(bearer.id);
    await deleteAvatarObject(bearer.id);
    res.status(Status.OK).json({
      message: "Deleted",
    });
  },
);
