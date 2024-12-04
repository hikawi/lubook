import { Request, RequestHandler } from "express";
import expressAsyncHandler from "express-async-handler";
import { verify } from "jsonwebtoken";
import { findUserById } from "./db/queries/user.query";

export type BearerAuth = { id: number, iat: number, exp: number };
export type AuthorizedRequest = Request & { bearer: BearerAuth };

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
export const softAuth: RequestHandler = expressAsyncHandler(async (req, res, next) => {
  req["bearer"] = await checkAuthCookie(req);
  next();
});

/**
 * Hard authentication. If it can't see that you're authorized, it will stop anything from being
 * run and returns a 401 instantly.
 */
export const auth: RequestHandler = expressAsyncHandler(async (req, res, next) => {
  const val = await checkAuthCookie(req);
  req["bearer"] = val;

  if (val == null) {
    res.status(401);
    throw new Error("Unauthorized");
  }

  const user = await findUserById(val.id);
  if (user == null) {
    res.status(422);
    throw new Error("You shouldn't exist?");
  }

  next();
});
