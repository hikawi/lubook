import express, { Router } from "express";
import {
  loginHandler,
  logoutHandler,
  registerHandler,
  updateUserHandler,
} from "../controllers/user.controller";
import { auth } from "../middlewares";

const router: Router = express.Router();
router.route("/register").post(registerHandler);
router.route("/users").post(auth, updateUserHandler);
router.route("/login").post(loginHandler);
router.route("/logout").post(logoutHandler);

export { router as accountsRouter };
