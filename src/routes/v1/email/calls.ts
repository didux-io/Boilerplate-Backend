import * as emailController from '../../../controllers/emailController';
import { Router } from 'express';
import { checkJwtToken } from '../../../middlewares/jwtMiddleware';
import { emailConfigEnabled } from '../../../middlewares/emailEnabledMiddleware';
import { isAdminJwtToken } from "../../../middlewares/isAdminMiddleware";

const router = Router();

router.post('/contact', emailController.sendContactEmail);

module.exports = router;
