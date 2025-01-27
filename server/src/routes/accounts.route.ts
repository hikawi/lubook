import express, { Router } from "express";
import {
  loginHandler,
  logoutHandler,
  registerHandler,
  updateUserHandler,
} from "../controllers/user.controller";
import { auth } from "../middlewares";

const accountsRouter: Router = express.Router();
accountsRouter.route("/register").post(registerHandler);
accountsRouter.route("/users").post(auth, updateUserHandler);
accountsRouter.route("/login").post(loginHandler);
accountsRouter.route("/logout").post(logoutHandler);

export default accountsRouter;
