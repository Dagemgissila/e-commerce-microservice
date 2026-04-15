import { Router } from "express";
import { validate } from "../middleware/validation.middleware";
import { LoginSchema, RegisterSchema } from "../dtos/auth.dtos";
import { AuthController } from "../controllers/auth.controller";

const router = Router();

router.post("/register", validate(RegisterSchema), AuthController.registerUser);
router.post("/login", validate(LoginSchema), AuthController.loginUser);

export const AuthRoutes = router;