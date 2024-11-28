import express, { Router } from "express";
import {
  blockHandler,
  blocklistHandler,
  isBlockedHandler,
} from "../controllers/block.controller";
import { auth } from "../middlewares";

const blocksRouter: Router = express.Router();
blocksRouter.get("/list", auth, blocklistHandler);
blocksRouter.get("/check/:username", auth, isBlockedHandler);
blocksRouter.post("/", auth, blockHandler);

export { blocksRouter };
