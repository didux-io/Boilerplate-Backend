import * as accountController from '../../../controllers/userController';
import { Router } from 'express';
import { checkJwtToken } from '../../../middlewares/jwtMiddleware';
import { emailConfigEnabled } from '../../../middlewares/emailEnabledMiddleware';

const router = Router();

/**
 * @swagger
 *
 * /account:
 *   post:
 *     description: Create account
 *     tags:
 *       - Authentication
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         type: json
 *         name: body
 *         description: Username, emailaddress
 *     responses:
 *       200:
 *         description: Create account
 */
router.post('/registrate', emailConfigEnabled, accountController.createAccount);

router.post('/finishRegistration', emailConfigEnabled, checkJwtToken, accountController.finishRegistration);

router.patch('/:userId', checkJwtToken, accountController.patchUserProfile);

module.exports = router;
