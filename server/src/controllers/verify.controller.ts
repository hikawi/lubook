import { RequestHandler } from "express";
import expressAsyncHandler from "express-async-handler";
import { z } from "zod";
import { isVerified, verify, verifyToken } from "../db/queries/verify.query";

/**
 * GET /verify/check: Checks if the username or email is verified yet.
 *
 * - Clearance Level: 0
 * - Object Class: Safe
 * - Accepts queries: { profile }.
 * - Returns:
 *   - 200 (Success): Returns an object { verified: boolean }.
 *   - 400 (Bad request): The profile doesn't match the schema.
 */
export const isVerifiedHandler: RequestHandler = expressAsyncHandler(
  async (req, res) => {
    const schema = z.object({
      profile: z.union([
        z.string().regex(/^[A-Za-z0-9-_]{2,32}$/),
        z.string().email(),
      ]),
    });
    const result = schema.safeParse(req.query);
    if (result.error) {
      res.status(400).json({ message: result.error.issues[0].message });
      return;
    }

    const verified = await isVerified(result.data.profile);
    res.status(200).json({ verified });
  },
);

/**
 * GET /verify: Attempts to verify via a browser's GET request.
 *
 * - Clearance Level: 0
 * - Object Class: Euclid
 * - Accepts queries: { username, token }.
 * - Returns:
 *   - 301 (Redirection): Whether it was successful or not, it returns to the web app.
 */
export const verifyUrlHandler: RequestHandler = expressAsyncHandler(
  async (req, res) => {
    const schema = z.object({
      username: z.string(),
      token: z.string(),
    });
    const result = schema.safeParse(req.query);
    if (!result.success) {
      res.redirect(`${process.env.CORS_ORIGIN}/verify/failed`);
      return;
    }

    await verifyToken(result.data.username, result.data.token);
  },
);

/**
 * POST /verify/request: Requests a new code to verify with.
 *
 * - Clearance Level:
 */
export const requestCode: RequestHandler = expressAsyncHandler(
  async (req, res) => {},
);

/**
 * POST /verify: Attempts to verify a username or email.
 *
 * - Clearance Level: 0
 * - Object Class: Euclid
 * - Accepts: { profile: string, code: string }.
 * - Returns:
 *   - 200 (OK): Returns an object { success: boolean }.
 *   - 400 (Bad Request): The body doesn't match the schema
 */
export const verifyTokenHandler: RequestHandler = expressAsyncHandler(
  async (req, res) => {
    const schema = z.object({
      profile: z.union([
        z.string().regex(/^[A-Za-z0-9-_]{2,32}$/),
        z.string().email(),
      ]),
      code: z.string().min(6),
    });
    const result = schema.safeParse(req.body);
    if (result.error) {
      res.status(400).json({ message: result.error.message });
      return;
    }

    const verifyResult = await verify(result.data.profile, result.data.code);
    res.status(200).json({ success: verifyResult });
  },
);
