import * as authChallengeController from '../../../controllers/authController';
import { Router } from 'express';
import { checkJwtToken } from '../../../middlewares/jwtMiddleware';
import { emailConfigEnabled } from '../../../middlewares/emailEnabledMiddleware';
import { webRtcConfigEnabled } from '../../../middlewares/webRtcEnabledMiddleware';

const router = Router();

/**
 * @swagger
 *
 * /auth/check:
 *   get:
 *     description: Get jwt token objects
 *     security:
 *       - Bearer:  []
 *     tags:
 *       - Authentication
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: an access token to objects
 */
router.get('/check', checkJwtToken, authChallengeController.checkToken);

router.get('/config', authChallengeController.getConfig);

router.get('/verifyemail/:verificationCode/:loginRedirect', emailConfigEnabled, authChallengeController.verifyEmail);

router.post('/authemail', emailConfigEnabled, authChallengeController.authenticateUser);

/**
 * @swagger
 *
 * /auth/{publicKey}/{DID}:
 *   get:
 *     description: Get a challenge for login
 *     tags:
 *       - Authentication
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: path
 *         type: string
 *         name: publicKey
 *         description: The Clients publicKey
 *       - in: path
 *         type: string
 *         name: projectDID
 *         description: The projectDID the Client belongs to
 *     responses:
 *       200:
 *         description: a challenge to sign
 */
router.get('/:publicKey/:did', webRtcConfigEnabled, authChallengeController.getAuthChallenge);

/**
 * @swagger
 *
 * /auth/{publicKey}:
 *   get:
 *     description: Get a challenge for login
 *     tags:
 *       - Authentication
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: path
 *         type: string
 *         name: publicKey
 *         description: The Clients publicKey
 *     responses:
 *       200:
 *         description: a challenge to sign
 */
router.get('/:publicKey', webRtcConfigEnabled, authChallengeController.getAuthChallenge);

/**
 * @swagger
 *
 * /auth/{publicKey}/{DID}:
 *   post:
 *     description: POST Signature with challenge, projectDID
 *     tags:
 *       - Authentication
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: path
 *         type: string
 *         name: publicKey
 *         description: The Clients publicKey
 *       - in: path
 *         type: string
 *         name: projectDID
 *         description: The projectDID the Client belongs to
 *       - in: body
 *         type: json
 *         name: body
 *         description: The signature and meta data
 *     responses:
 *       200:
 *         description: Get the credentials
 */
router.post('/:publicKey/:did', webRtcConfigEnabled, authChallengeController.validateSignature);

/**
 * @swagger
 *
 * /auth/{publicKey}:
 *   post:
 *     description: POST Signature with challenge
 *     tags:
 *       - Authentication
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: path
 *         type: string
 *         name: publicKey
 *         description: The Clients publicKey
 *       - in: body
 *         type: json
 *         name: body
 *         description: The signature and meta data
 *     responses:
 *       200:
 *         description: Get the credentials
 */
router.post('/:publicKey', webRtcConfigEnabled, authChallengeController.validateSignature);

module.exports = router;
