import { Router } from "express";

const router = Router();

router.use('/v1', require(__dirname + '/v1/index.js'));
 
export default router;