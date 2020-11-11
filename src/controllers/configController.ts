import { Request, Response } from "express";
import { config } from "../config/config";

export async function getConfig(req: Request, res: Response): Promise<void> {
    res.status(200).send({
        authWsUrl: config.authWsUrl,
        emailEnabled: config.emailEnabled,
        webRtcEnabled: config.webRtcEnabled
    });
}

