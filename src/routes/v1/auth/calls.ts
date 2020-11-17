import * as authChallengeController from "../../../controllers/auth/authController";
import { Router } from "express";
import jwtMiddleware from "../../../middlewares/jwtMiddleware";
import emailEnabledMiddleware from "../../../middlewares/emailEnabledMiddleware";
import webRtcEnabledMiddleware from "../../../middlewares/webRtcEnabledMiddleware";

export const routerAuth = Router();

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
routerAuth.get("/check", jwtMiddleware, authChallengeController.checkToken);

routerAuth.get("/recoverAccount/:recoveryCode/:redirectUrl", authChallengeController.recoverAccount);

routerAuth.get("/cancelRecoverAccount/:cancelRecoveryCode/:redirectUrl", authChallengeController.cancelRecoverAccount);

routerAuth.get("/verifyemail/:verificationCode/:loginRedirect", emailEnabledMiddleware, authChallengeController.verifyEmail);

routerAuth.post("/authemail", emailEnabledMiddleware, authChallengeController.authenticateUser);

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
routerAuth.get("/:publicKey/:did", webRtcEnabledMiddleware, authChallengeController.getAuthChallenge);

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
routerAuth.get("/:publicKey", webRtcEnabledMiddleware, authChallengeController.getAuthChallenge);

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
routerAuth.post("/:publicKey/:did", webRtcEnabledMiddleware, authChallengeController.validateSignature);

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
routerAuth.post("/:publicKey", webRtcEnabledMiddleware, authChallengeController.validateSignature);
