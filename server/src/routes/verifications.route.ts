import express, { Router } from "express";
import {
  isVerifiedHandler,
  verifyTokenHandler,
} from "../controllers/verify.controller";

const verificationsRouter: Router = express.Router();
verificationsRouter.route("/").get(isVerifiedHandler).post(verifyTokenHandler);

export default verificationsRouter;
