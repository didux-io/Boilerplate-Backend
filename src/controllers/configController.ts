import { Request, Response, NextFunction } from 'express';
import { config } from '../config/config';

export async function getConfig(req: Request, res: Response, next: NextFunction): Promise<void> {
    res.status(200).send({
        authWsUrl: config.authWsUrl,
        emailEnabled: config.emailEnabled,
        webRtcEnabled: config.webRtcEnabled
    });
}

