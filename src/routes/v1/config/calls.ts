import * as configController from "../../../controllers/configController";
import { Router } from "express";

const router = Router();

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
router.get("", configController.getConfig);

module.exports = router;
