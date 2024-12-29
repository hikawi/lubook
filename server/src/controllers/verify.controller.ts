import { RequestHandler } from "express";
import expressAsyncHandler from "express-async-handler";
import { z } from "zod";
import {
  generateVerification,
  isVerified,
  shouldGenerate,
  verifyCode,
} from "../db/queries/verify.query";
import { Status } from "../misc/status";

/**
 * GET /verify/check: Checks if the username or email is verified yet.
 *
 * - Clearance Level: 0
 * - Object Class: Safe
 * - Special Containment Procedures:
 *   + { profile: string }.
 * - Addendum:
 *   - 200/OK: Returns an object { verified: boolean }.
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
      res
        .status(Status.BAD_REQUEST)
        .json({ message: result.error.issues[0].message });
      return;
    }

    const verified = await isVerified(result.data.profile);
    res.status(Status.OK).json({ verified });
  },
);

/**
 * GET /verify: Attempts to verify via a browser's GET request.
 *
 * - Clearance Level: 0
 * - Object Class: Euclid
 * - Special Containment Procedures:
 *   + Accepts: Query { username: string, token: string }.
 *   + Mutates: "verification" table.
 * - Addendum:
 *   - 302/Found: Whether it was successful or not, it returns to the web app.
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

    const verifyResult = await verifyCode(
      result.data.username,
      result.data.token,
      true,
    );
    if (verifyResult) {
      res.redirect(`${process.env.CORS_ORIGIN}/verify/success`);
    } else {
      res.redirect(`${process.env.CORS_ORIGIN}/verify/failed`);
    }
  },
);

/**
 * POST /verify/request: Requests a new code to verify with.
 *
 * - Clearance Level: 0
 * - Object Class: Euclid
 * - Special Containment Procedures:
 *   + Accepts body: { profile: string }
 *   + Mutates: "verification" table
 * - Addendum:
 *   + 201/Created: A new verification code and url token has been created.
 *   + 304/NotModified: A code has not been created. Either on cooldown or user is verified.
 *   + 400/BadRequest: The body is malformed.
 *   + 404/NotFound: Generation failed because no profile.
 */
export const requestCodeHandler: RequestHandler = expressAsyncHandler(
  async (req, res) => {
    const schema = z.object({
      profile: z.union([
        z.string().regex(/^[A-Za-z0-9-_]{2,32}$/),
        z.string().email(),
      ]),
    });
    const body = schema.safeParse(req.body);
    if (body.error) {
      res
        .status(Status.BAD_REQUEST)
        .json({ message: body.error.issues[0].message });
      return;
    }

    if (!(await shouldGenerate(body.data.profile))) {
      res.status(Status.NOT_MODIFIED).json({
        message: "User is already verified or email service is on cooldown.",
      });
      return;
    }

    const sent = await generateVerification(body.data.profile);
    if (sent) {
      res
        .status(Status.CREATED)
        .json({ message: "Successfully generated a new verification email" });
    } else {
      res
        .status(Status.NOT_FOUND)
        .json({ message: "Does that profile exist?" });
    }
  },
);

/**
 * POST /verify: Attempts to verify a username or email.
 *
 * - Clearance Level: 0
 * - Object Class: Euclid
 * - Special Containment Procedures:
 *   + Accepts body { profile: string, code: string }.
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
      res.status(Status.BAD_REQUEST).json({ message: result.error.issues[0].message });
      return;
    }

    const verifyResult = await verifyCode(
      result.data.profile,
      result.data.code,
      false,
    );
    res.status(Status.OK).json({ success: verifyResult });
  },
);
