import * as userController from '../../../controllers/userController';
import { Router } from 'express';
import { checkJwtToken } from '../../../middlewares/jwtMiddleware';
import { emailConfigEnabled } from '../../../middlewares/emailEnabledMiddleware';
import { isAdminJwtToken } from "../../../middlewares/isAdminMiddleware";

const router = Router();

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
router.post('/registrate', emailConfigEnabled, userController.createAccount);

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
router.post('/finishRegistration', checkJwtToken, userController.finishRegistration);

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
router.patch('/:userId', checkJwtToken, userController.patchUserProfile);

router.get('/list', checkJwtToken, isAdminJwtToken, userController.usersList);

router.patch('/admin/:userId', checkJwtToken, isAdminJwtToken, userController.patchUserAdmin);

module.exports = router;
