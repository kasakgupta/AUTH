import {Router} from 'express';
import * as authController from '../controllers/auth.controller.js';

const authRouter = Router();

authRouter.post("/register", authController.register);
authRouter.get("/get-me", authController.getMe);
authRouter.get("/refresh-token", authController.refreshToken);
authRouter.post("/login", authController.login);
authRouter.get("/logout", authController.logout);
authRouter.get("/logout-all", authController.logoutAll);
authRouter.post("/verify-email", authController.verifyEmail);

export default authRouter;