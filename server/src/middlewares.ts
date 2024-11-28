import { Request, RequestHandler, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import { verify } from "jsonwebtoken";
import { findUserById } from "./db/queries/user.query";

export type AuthorizedRequest = Request & {
  bearer: {
    id: number;
    iat: number;
    exp: number;
  };
};

async function checkBearerHeader(req: Request, res: Response) {
  const groups = /^Bearer (.+)$/.exec(req.headers.authorization || "");
  if (!groups) return null;

  try {
    const payload = verify(groups[1], process.env.JWT_SECRET!);
    return payload;
  } catch (e) {
    return null;
  }
}

export const auth: RequestHandler = expressAsyncHandler(
  async (req, res, next) => {
    const val = await checkBearerHeader(req, res);
    if (val == null) {
      res.status(401);
      throw new Error("Unauthorized");
    } else {
      req["bearer"] = val;
    }

    const user = await findUserById(val["id"]);
    if (user == null) {
      res.status(422);
      throw new Error("You shouldn't exist?");
    }

    next();
  }
);
