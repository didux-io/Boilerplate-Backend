import { Router } from "express";

const router = Router();

/* eslint @typescript-eslint/no-var-requires: 1 */
router.use("/user", require(__dirname + "/user/calls"));

/* eslint @typescript-eslint/no-var-requires: 1 */
router.use("/auth", require(__dirname + "/auth/calls"));

/* eslint @typescript-eslint/no-var-requires: 1 */
router.use("/config", require(__dirname + "/config/calls"));
 
module.exports = router;
