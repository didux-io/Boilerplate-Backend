import { Router } from "express";
import { routerAuth } from "./auth/calls";
import { routerConfig } from "./config/calls";
import { routerEmail } from "./email/calls";
import { routerUser } from "./user/calls";

export const routerV1 = Router();

routerV1.use("/user", routerUser);

routerV1.use("/auth", routerAuth);

routerV1.use("/config", routerConfig);

routerV1.use("/email", routerEmail);

