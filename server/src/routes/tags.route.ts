import express, { Router } from "express";
import {
  createTagHandler,
  deleteTagHandler,
  editTagHandler,
  getTagsHandler,
} from "../controllers/tag.controller";
import { authLevel } from "../middlewares";

const tagsRouter: Router = express.Router();

tagsRouter
  .route("/")
  .get(getTagsHandler)
  .post(authLevel(3), createTagHandler)
  .put(authLevel(3), editTagHandler)
  .delete(authLevel(3), deleteTagHandler);

export default tagsRouter;
