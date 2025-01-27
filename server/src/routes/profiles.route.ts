import express, { Router } from "express";
import {
  deleteAvatarHandler,
  getProfileHandler,
  updateAvatarHandler,
  updateProfileHandler,
} from "../controllers/profile.controller";
import { auth, imageUpload, softAuth } from "../middlewares";

const profilesRouter: Router = express.Router();
profilesRouter
  .route("/")
  .get(softAuth, getProfileHandler)
  .put(auth, updateProfileHandler);
profilesRouter
  .route("/avatar")
  .post(auth, imageUpload, updateAvatarHandler)
  .delete(auth, deleteAvatarHandler);

export default profilesRouter;
