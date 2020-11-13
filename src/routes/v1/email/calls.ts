import * as emailController from "../../../controllers/emailController";
import { Router } from "express";

export const routerEmail = Router();

routerEmail.post("/contact", emailController.sendContactEmail);
