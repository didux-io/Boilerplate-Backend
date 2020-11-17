import { Request, Response, NextFunction } from "express";
import { config } from "../config/config";

export default function(req: Request, res: Response, next: NextFunction): void {
    console.log("webRtcConfigEnabled CALLED");
    if (!config.webRtcEnabled) {
        res.status(400).send({error: "WEBRTC_CONF_DISABLED"});
        next("WEBRTC configuration disabled.");
    } else {
        next();
    }
}
