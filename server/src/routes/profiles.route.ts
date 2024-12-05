import express, { Router } from "express";
import { getMeHandler } from "../controllers/profile.controller";
import { auth } from "../middlewares";

const router: Router = express.Router();
router.route("/").get(auth, getMeHandler);

export { router as profilesRouter };
