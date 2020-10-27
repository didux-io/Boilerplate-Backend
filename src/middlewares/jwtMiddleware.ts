import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import * as fs from 'fs';

export function checkJwtToken(req: Request, res: Response, next: NextFunction) {
    if (res.locals.skipJwtCheck) {
        next();
    } else if (!req.headers.authorization) {
        res.status(400).send({error: 'req.headers.authorization is missing'});
        next("req.headers.authorization is missing");
    } else {
        const token = req.headers.authorization;
        const cert = fs.readFileSync('./jwt-keys/public.pem');
        jwt.verify(token, cert, (err: any) => {
            if (err) {
                res.status(400).send({error: 'JWT_INVALID'});
                next('JWT not valid.');
            } else {
                next();
            }
        });
    }
}
