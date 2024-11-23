import express, { Router } from "express";
import { login, register } from "../controllers/user.controller";

const router: Router = express.Router();
router.post("/register", register).post("/login", login);

export { router as accountsRouter };
