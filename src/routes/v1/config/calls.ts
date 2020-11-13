import * as configController from "../../../controllers/configController";
import { Router } from "express";

export const routerConfig = Router();

/**
 * @swagger
 *
 * /config:
 *   get:
 *     description: Get config
 *     tags:
 *       - Config
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Get the config
 */
routerConfig.get("", configController.getConfig);

