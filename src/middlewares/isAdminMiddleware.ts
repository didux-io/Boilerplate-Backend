import { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";
import * as fs from "fs";
import { IJWTDecoded } from "../interfaces/jwtDecoded.interface";

export default function(req: Request, res: Response, next: NextFunction): void {
    if (res.locals.skipJwtCheck) {
        next();
    } else if (!req.headers.authorization) {
        res.status(400).send({error: "req.headers.authorization is missing"});
        next("req.headers.authorization is missing");
    } else {
        const token = req.headers.authorization;
        const cert = fs.readFileSync("./jwt-keys/public.pem");
        jwt.verify(token, cert, (err: unknown, decoded: IJWTDecoded) => {
            if (decoded.userPower === 1) {
                next();
            } else {
                res.status(400).send({error: "JWT_UNAUTHORIZED"});
                next("JWT not admin");
            }
        });
    }
}