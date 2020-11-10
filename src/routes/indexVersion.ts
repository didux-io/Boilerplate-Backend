import { Router } from "express";
import { routerV1 } from "./v1/index";

const router = Router();

/* eslint @typescript-eslint/no-var-requires: 1 */
router.use("/v1", routerV1);

export default router;
