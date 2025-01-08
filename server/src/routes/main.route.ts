import cors from "cors";
import express, { Router } from "express";
import { auth } from "../middlewares";
import { accountsRouter } from "./accounts.route";
import { blocksRouter } from "./blocks.route";
import { profilesRouter } from "./profiles.route";
import verificationsRouter from "./verifications.route";

const mainRouter: Router = express.Router();

mainRouter.options("*", cors());
mainRouter.use("/", accountsRouter);
mainRouter.use("/profile", profilesRouter);
mainRouter.use("/block", blocksRouter);
mainRouter.use("/auth", auth);
mainRouter.use("/verify", verificationsRouter);

export default mainRouter;
