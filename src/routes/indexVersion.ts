import { Router } from "express";

const router = Router();

/* eslint @typescript-eslint/no-var-requires: 1 */
router.use("/v1", require(__dirname + "/v1/index.js"));
 
export default router;
