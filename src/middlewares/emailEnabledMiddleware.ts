import { Request, Response, NextFunction } from 'express';
import { config } from '../config/config';

export function emailConfigEnabled(req: Request, res: Response, next: NextFunction) {
    if (!config.emailEnabled) {
        res.status(400).send({error: 'EMAIL_CONF_DISABLED'});
        next('EMAIL configuration disabled.');
    } else {
        next();
    }
}
