import * as jwt from 'jsonwebtoken';
import { Request } from 'express';

export function getDidAddress(token: string) {
    const decoded = jwt.decode(token, {complete: true});
    return decoded["payload"].did;
}

export function getPublicKey(token: string) {
    const decoded = jwt.decode(token, {complete: true});
    return decoded["payload"].publicKey;
}

export function getClaims(req: Request) {
    const token = req.headers.authorization;
    const decoded = jwt.decode(token, {complete: true});
    return decoded["payload"];
}