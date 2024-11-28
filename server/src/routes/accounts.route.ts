import express, { Router } from "express";
import { loginHandler, registerHandler } from "../controllers/user.controller";

const router: Router = express.Router();
router.post("/register", registerHandler).post("/login", loginHandler);

export { router as accountsRouter };
