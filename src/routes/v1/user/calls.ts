import * as accountController from "../../../controllers/userController";
import { Router } from "express";
import { checkJwtToken } from "../../../middlewares/jwtMiddleware";
import { emailConfigEnabled } from "../../../middlewares/emailEnabledMiddleware";

export const routerUser = Router();

/**
 * @swagger
 *
 * /user/registrate:
 *   post:
 *     description: Create account
 *     tags:
 *       - User
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         type: application/json
 *         name: body
 *         description: Registrate a new user
 *     responses:
 *       200:
 *         description: User registered
 */
routerUser.post("/registrate", emailConfigEnabled, accountController.createAccount);

/**
 * @swagger
 *
 * /user/finishRegistration:
 *   post:
 *     description: Create account
 *     tags:
 *       - User
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         type: application/json
 *         name: body
 *         description: Registrate a new user
 *     responses:
 *       200:
 *         description: User registered
 */
routerUser.post("/finishRegistration", checkJwtToken, accountController.finishRegistration);

/**
 * @swagger
 *
 * /user/:userId:
 *   post:
 *     description: Create account
 *     tags:
 *       - User
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         type: application/json
 *         name: body
 *         description: Registrate a new user
 *     responses:
 *       200:
 *         description: User registered
 */
routerUser.patch("/:userId", checkJwtToken, accountController.patchUserProfile);
