import * as userController from '../../../controllers/userController';
import { Router } from 'express';
import { checkJwtToken } from '../../../middlewares/jwtMiddleware';
import { emailConfigEnabled } from '../../../middlewares/emailEnabledMiddleware';
import { isAdminJwtToken } from "../../../middlewares/isAdminMiddleware";

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
routerUser.post('/registrate', emailConfigEnabled, userController.createAccount);

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
routerUser.post('/finishRegistration', checkJwtToken, userController.finishRegistration);

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
routerUser.patch('/:userId', checkJwtToken, userController.patchUserProfile);

routerUser.get('/list', checkJwtToken, isAdminJwtToken, userController.usersList);

routerUser.patch('/admin/:userId', checkJwtToken, isAdminJwtToken, userController.patchUserAdmin);
