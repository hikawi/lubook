import express, { Router } from "express";
import {
  blockTagHandler,
  blockUserHandler,
  getBlockedUsersHandler,
  getBlockTagsHandler,
  isUserBlockedHandler,
  unblockTagHandler,
  unblockUserHandler,
} from "../controllers/block.controller";
import { auth } from "../middlewares";

const blocksRouter: Router = express.Router();

blocksRouter.route("/users/:username").get(auth, isUserBlockedHandler);
blocksRouter
  .route("/users")
  .get(auth, getBlockedUsersHandler)
  .post(auth, blockUserHandler)
  .delete(auth, unblockUserHandler);

blocksRouter
  .route("/tags")
  .get(auth, getBlockTagsHandler)
  .post(auth, blockTagHandler)
  .delete(auth, unblockTagHandler);

export default blocksRouter;
