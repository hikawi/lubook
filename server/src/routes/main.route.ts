import cors from "cors";
import express, { Router } from "express";
import { auth } from "../middlewares";
import { Status } from "../misc/status";
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

mainRouter.route("/").get(async (req, res) => {
  res.status(Status.OK).json({ message: "Hello! This is Lubook's API server" });
});

export default mainRouter;
