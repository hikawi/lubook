import express, { Router } from "express";
import {
  blockHandler,
  blocklistHandler,
  isBlockedHandler,
  unblockHandler,
} from "../controllers/block.controller";
import { auth } from "../middlewares";

const blocksRouter: Router = express.Router();

blocksRouter.route("/list").get(auth, blocklistHandler);
blocksRouter
  .route("/")
  .get(auth, isBlockedHandler)
  .post(auth, blockHandler)
  .delete(auth, unblockHandler);

export { blocksRouter };
