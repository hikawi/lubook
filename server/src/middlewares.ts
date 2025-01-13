import { Request, RequestHandler } from "express";
import expressAsyncHandler from "express-async-handler";
import fileUpload from "express-fileupload";
import { verify } from "jsonwebtoken";
import { findUserById } from "./db/queries/user.query";
import { Status } from "./misc/status";

export type BearerAuth = { id: number; iat: number; exp: number };
export type SoftAuthorizedRequest = Request & { bearer?: BearerAuth };
export type AuthorizedRequest = Request & { bearer: BearerAuth };
export type RequestedUser = {
  id: number;
  username: string;
  email: string;
  role: string;
  joined: Date;
};

async function checkAuthCookie(req: Request) {
  const authCookie = req.cookies["authorization"];

  try {
    const payload = verify(authCookie, process.env.JWT_SECRET!);
    return payload as BearerAuth | null;
  } catch (e) {
    return null;
  }
}

/**
 * Soft authentication only attempts to check if the user is authenticated. But does not
 * throw an error if not.
 */
export const softAuth: RequestHandler = expressAsyncHandler(
  async (req, res, next) => {
    req["bearer"] = await checkAuthCookie(req);
    next();
  },
);

/**
 * Hard authentication. If it can't see that you're authorized, it will stop anything from being
 * run and returns a 401 instantly.
 */
export const auth: RequestHandler = expressAsyncHandler(
  async (req, res, next) => {
    const val = await checkAuthCookie(req);
    req["bearer"] = val;

    if (val == null) {
      res.status(Status.UNAUTHORIZED).json({ message: "Unauthorized" });
      return;
    }

    const user = await findUserById(val.id);
    if (user.length == 0) {
      res
        .status(Status.UNPROCESSABLE_ENTITY)
        .clearCookie("authorization")
        .json({ message: "You shouldn't exist?" });
      return;
    }

    req["user"] = user[0];
    next();
  },
);

/**
 * The image upload middleware. Accepts up to 20MB of an image.
 */
export const imageUpload: RequestHandler = fileUpload({
  abortOnLimit: true,
  limits: {
    fileSize: 20 * 1024 * 1024,
  },
});
