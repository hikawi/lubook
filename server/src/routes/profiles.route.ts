import express, { Router } from "express";
import {
  deleteAvatarHandler,
  getProfileHandler,
  updateAvatarHandler,
} from "../controllers/profile.controller";
import { auth, imageUpload, softAuth } from "../middlewares";

const router: Router = express.Router();
router.route("/").get(softAuth, getProfileHandler);
router
  .route("/avatar")
  .post(auth, imageUpload, updateAvatarHandler)
  .delete(auth, deleteAvatarHandler);

export { router as profilesRouter };
