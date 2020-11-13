import * as emailController from "../../../controllers/emailController";
import { Router } from "express";
import { checkJwtToken } from "../../../middlewares/jwtMiddleware";
import { emailConfigEnabled } from "../../../middlewares/emailEnabledMiddleware";
import { isAdminJwtToken } from "../../../middlewares/isAdminMiddleware";

export const routerEmail = Router();

routerEmail.post("/contact", emailController.sendContactEmail);
