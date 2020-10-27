import { Request, Response, NextFunction } from 'express';
import { config } from '../config/config';
import * as jwt from 'jsonwebtoken';
import * as fs from 'fs';
import { checkKeyForDid, isValidCredentials } from '../utils/web3-utils';
import { generateChallenge, getJWTToken } from '../utils/token-utils';
import { User } from "../db/models/user";
import * as bcrypt from 'bcrypt';
import { getClaims } from '../utils/jwt-utils';
import { emailConfigEnabled } from '../middlewares/emailEnabledMiddleware';

export async function getAuthChallenge(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const publicKey = req.params.publicKey;
        let did = req.params.did;

        if (!did || did == 'undefined') {
            did = publicKey;
        }

        if (!publicKey || publicKey == 'undefined') {
            res.status(400).send({error: 'Publickey missing'});
            return;
        } else if (!await checkKeyForDid(did, publicKey)) {
            res.status(400).send({ error: publicKey + ' is not part of identity ' + did });
            return;
        }
        const loginEndpoint = 'https://' + req.get('host') + req.originalUrl;
        const timestamp = Math.floor(Date.now() / 1000).toString();
        const challenge = await generateChallenge(publicKey, did, loginEndpoint, timestamp);
        if (challenge) {
            res.status(200).send({
                challenge: challenge,
                publicKey: publicKey,
                did: did,
                timestamp: timestamp,
                loginEndpoint: loginEndpoint
            });
            return;
        } else {
            res.status(500).send({
                error: 'Could not save challenge to database'
            });
            return;
        }
    } catch (error) {
        console.log('ERROR - getAuthChallenge: ', error);
        res.status(500).send({ error: error });
    }
}

export async function validateSignature(req: Request, res: Response, next: NextFunction): Promise<void> {
    const signature = req.body.signature;
    const publicKey = req.body.publicKey;
    let did = req.body.did;
    const timestamp = req.body.timestamp;
    const credentials = req.body.credentials;

    if (!did || did == 'undefined') {
        did = publicKey;
    }

    const currentTimestamp = Math.floor(Date.now() / 1000);
    const loginEndpoint = 'https://' + req.get('host') + req.originalUrl;
    if (!signature) {
        res.status(400).send({ error: 'Signature missing in body' });
        return;
    } else if (!publicKey) {
        res.status(400).send({ error: 'Publickey missing in body' });
        return;
    } else if (!timestamp) {
        res.status(400).send({ error: 'Timestamp missing in body' });
        return;
    } else if (parseInt(timestamp) + 10 < currentTimestamp) {
        res.status(400).send({ error: 'Timestamp expired' });
        return;
    } else if (!await checkKeyForDid(did, publicKey)) {
        res.status(400).send({ error: + publicKey + ' is not part of identity ' + did });
        return;
    }
    // So we can authenticate with credentials
    // - Create an account for the email in this case if it does not yet exists
    // - Add the email to the JWT
    let email = null;
    let user = null;
    if (credentials) {
        const validCredentials = await isValidCredentials(credentials);
        if (validCredentials) {
            const emailCred = credentials.credential.EMAIL.credentialSubject.credential.value;
            email = emailCred;
            const userCount = await User.count();
            // If there are no users make the first one admin
            if (userCount === 0) {
                user = await User.create({
                    email: emailCred,
                    did,
                    publicKey,
                    userPower: 100
                });
            // And 
            } else {
                user = await User.findOne({where: {email: emailCred}});
                if (user) {
                    console.log('User already exists, updating!');
                    await User.update({
                        did,
                        publicKey,
                    }, {
                        where: { id: user.id }
                    });
                } else {
                    console.log('User not yet created, create one!');
                    user = await User.create({
                        email: emailCred,
                        did,
                        publicKey,
                        userPower: 1
                    });
                }
            }
        }
    }

    try {
        const challenge = await generateChallenge(publicKey, did, loginEndpoint, timestamp);
        const signingAddress = await config.web3.eth.accounts.recover(challenge, signature);
        if (signingAddress.toLowerCase() === publicKey.toLowerCase()) {
            res.status(200).send({
                token: getJWTToken(user)
            });
            return;
        } else {
            res.status(400).send({ error: 'Publickey doesn\'t match signature.' });
            return;
        }
    } catch (error) {
        console.error(error);
        res.status(400).send({ error: 'Could not validate signature.' });
        return;
    }
}

export async function checkToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    if (res.locals.skipJwtCheck) {
        next();
    } else if (!req.headers.authorization) {
        res.status(400).send({ error: 'req.headers.authorization is missing' });
        next("req.headers.authorization is missing");
    } else {
        const token = req.headers.authorization;
        const cert = fs.readFileSync('./jwt-keys/public.pem');
        jwt.verify(token, cert, (err: any) => {
            if (err) {
                res.status(400).send({ error: 'JWT_INVALID' });
                next('JWT not valid.');
            } else {
                const payload = getClaims(req);
                res.status(200).send({ payload: payload });
            }
        });
    }
}

export async function verifyEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    if (res.locals.skipJwtCheck) {
        next();
    } 
    const verificationCode = req.params.verificationCode;
    const loginRedirect = req.params.loginRedirect;
    const user = await User.findOne({where: {emailVerificationCode: verificationCode}});
    if (user) {
        await User.update({
            emailVerified: true
        }, {
            where: { emailVerificationCode: verificationCode }
        });
        res.redirect(loginRedirect + '?emailVerified=true');
    } else {
        res.redirect(loginRedirect + '?emailVerified=false');
    }
}

export async function authenticateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    const email = req.body.email;
    const password = req.body.password;
    if (!email) {
        res.status(400).send({error: 'Email missing'});
    } else if (!password) {
        res.status(400).send({error: 'Password missing'});
    } else {
        try {
            const user = await User.findOne({
                where: { email: email, emailVerified: true }
            });
            if (user) {
                bcrypt.compare(password, user.password).then((validPassword: boolean) => {
                    if (!validPassword) {
                        res.status(401).send({error: 'Wachtwoord en/of gebruikersnaam is niet correct'});
                    } else {
                        res.status(200).send({
                            token: getJWTToken(user)
                        });
                    }
                });
            } else {
                res.status(400).send({error: 'Wachtwoord en/of gebruikersnaam is niet correct'});
            }
        } catch (err) {
            console.error(err);
            res.status(400).send({error: 'Wachtwoord en/of gebruikersnaam is niet correct'});
        }
    }
}

export async function getConfig(req: Request, res: Response, next: NextFunction): Promise<void> {
    res.status(200).send({
        authWsUrl: config.authWsUrl,
        emailEnabled: config.emailEnabled,
        webRtcEnabled: config.webRtcEnabled
    });
}

