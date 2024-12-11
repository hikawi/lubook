import express, { Router } from "express";
import {
  isVerifiedHandler,
  verifyTokenHandler,
  verifyUrlHandler,
} from "../controllers/verify.controller";

const verificationsRouter: Router = express.Router();

verificationsRouter.route("/check").get(isVerifiedHandler);
verificationsRouter.route("/").get(verifyUrlHandler).post(verifyTokenHandler);

export default verificationsRouter;
