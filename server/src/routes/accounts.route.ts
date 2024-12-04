import express, { Router } from "express";
import { loginHandler, logoutHandler, registerHandler } from "../controllers/user.controller";

const router: Router = express.Router();
router
  .post("/register", registerHandler)
  .post("/login", loginHandler)
  .post("/logout", logoutHandler);

export { router as accountsRouter };
