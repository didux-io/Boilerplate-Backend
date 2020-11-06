import * as accountController from '../../../controllers/userController';
import { Router } from 'express';
import { checkJwtToken } from '../../../middlewares/jwtMiddleware';
import { emailConfigEnabled } from '../../../middlewares/emailEnabledMiddleware';

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
router.post('/registrate', emailConfigEnabled, accountController.createAccount);

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
router.post('/finishRegistration', checkJwtToken, accountController.finishRegistration);

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
router.patch('/:userId', checkJwtToken, accountController.patchUserProfile);

module.exports = router;
