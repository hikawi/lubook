import express, { Router } from "express";
import { getMeHandler, getProfileHandler } from "../controllers/profile.controller";
import { auth } from "../middlewares";

const router: Router = express.Router();
router.route("/").get(auth, getMeHandler);
router.route("/:username").get(getProfileHandler);

export { router as profilesRouter };
