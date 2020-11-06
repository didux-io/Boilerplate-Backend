import { Request, Response, NextFunction } from 'express';
import { config } from '../config/config';
import * as jwt from 'jsonwebtoken';
import * as fs from 'fs';
import { checkKeyForDid, isValidCredentials } from '../utils/web3-utils';
import { generateChallenge, getJWTToken } from '../utils/token-utils';
import { User } from "../db/models/user";
import * as bcrypt from 'bcrypt';
import { getClaims } from '../utils/jwt-utils';
import { createRecoveryCancelCode, createRecoveryCode, sendRecoveryAccount } from '../utils/email-utils';
import { calculateMinutesDifference } from '../utils/global-utils';
import { Op } from 'sequelize';

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
    // - Create an account for the email in this case if it does not yet exist
    // - If the account exists, check if the publickey is the same, otherwhise send 
    let user = await User.findOne({ where: { publicKey }});
    let recoveryUser = null;
    if (!user && credentials) {
        const validCredentials = await isValidCredentials(credentials);
        if (validCredentials) {
            // Email validation
            if (credentials && credentials.credential && credentials.credential.EMAIL) {
                const email = credentials.credential.EMAIL.credentialSubject.credential.value;
                const userCount = await User.count();
                // If there are no users make the first one admin
                if (userCount === 0) {
                    user = await User.create({
                        email,
                        did,
                        publicKey,
                        userPower: 1
                    });
                } else {
                    // Let's check if the email exists and the publicKey is not the same as being sent right now
                    recoveryUser = await User.findOne({ where: { 
                        email, 
                        publicKey: {
                            [Op.not]: publicKey
                        }
                    }});
                    // If we can find such a user, it already exists. Proces recovery process
                    if (recoveryUser) {
                        console.log('User already exists with WebRTC, sending recovery email!');
                        // Send recovery email
                        const recoveryCode = createRecoveryCode();
                        const recoveryCancelCode = createRecoveryCancelCode();
                        await User.update({
                            accountRecoveryCode: recoveryCode,
                            accountRecoveryCancelCode: recoveryCancelCode,
                            accountRecoveryDate: new Date(),
                            accountRecoveryPublicKey: publicKey,
                            accountRecoveryDid: did
                        }, {
                            where: { id: recoveryUser.id }
                        });
                        sendRecoveryAccount(recoveryUser.email, recoveryCode, recoveryCancelCode);
                    // If we could not find any user
                    } else {
                        // Check if we can find a user with an email (regardless of WebRTC or 'normal' login)
                        const foundUser = await User.findOne({ where: { email }});
                        // So if we found a user, update it with the WebRTC information (publickey + did)
                        if (foundUser) {
                            await User.update({
                                did,
                                publicKey
                            }, {
                                where: { id: foundUser.id }
                            });
                            user = await User.findOne({ where: { email }});
                        // Otherwhise create the new WebRTC user
                        } else {
                            console.log('User not yet created, create one!');
                            user = await User.create({
                                email,
                                did,
                                publicKey,
                                userPower: 100
                            });
                        }
                    }
                }
            }
        }
    }

    try {
        if (user) {
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
        } else if (recoveryUser) {
            res.status(200).send({
                extra: 'recover'
            })
        } else if (!recoveryUser) {
            res.status(200).send({
                extra: 'identify'
            })
        }
    } catch (error) {
        console.error(error);
        res.status(400).send({ error: 'Could not validate signature.' });
        return;
    }
}

export async function checkToken(req: Request, res: Response, next: NextFunction): Promise<void> {
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

export async function verifyEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    const verificationCode = req.params.verificationCode;
    const loginRedirect = req.params.loginRedirect;
    const user = await User.findOne({where: {emailVerificationCode: verificationCode}});
    if (user) {
        await User.update({
            emailVerified: true,
            active: true
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
                    } else if (user.active != true ) {
                        res.status(401).send({error: 'Gebruiker niet actief'});
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

export async function recoverAccount(req: Request, res: Response, next: NextFunction): Promise<void> {
    const recoveryCode = req.params.recoveryCode;
    const redirectUrl = req.params.redirectUrl;

    const user = await User.findOne({where: { accountRecoveryCode: recoveryCode }});

    if (user) {
        const minutesDifference = calculateMinutesDifference(new Date(), user.accountRecoveryDate);
        console.log('minutesDifference:', minutesDifference);
        if (minutesDifference < config.accountRecoveryTimeInMinutes) {
            await User.update({
                publicKey: user.accountRecoveryPublicKey,
                did: user.accountRecoveryDid,
                accountRecoveryCode: null,
                accountRecoveryCancelCode: null,
                accountRecoveryDate: null,
                accountRecoveryPublicKey: null,
                accountRecoveryDid: null
            }, {
                where: { accountRecoveryCode: recoveryCode }
            })
            res.redirect(redirectUrl + '?emailRecovered=true');
        } else {
            res.redirect(redirectUrl + '?emailRecoveryExpired=true');
        }
    } else {
        res.redirect(redirectUrl + '?emailRecovered=false');
    }
}

export async function cancelRecoverAccount(req: Request, res: Response, next: NextFunction): Promise<void> {
    const cancelRecoveryCode = req.params.cancelRecoveryCode;
    const redirectUrl = req.params.redirectUrl;
    const user = await User.findOne({where: { accountRecoveryCancelCode: cancelRecoveryCode }});

    if (user) {
        await User.update({
            accountRecoveryCode: null,
            accountRecoveryCancelCode: null,
            accountRecoveryDate: null,
            accountRecoveryPublicKey: null,
            accountRecoveryDid: null
        }, {
            where: { accountRecoveryCancelCode: cancelRecoveryCode }
        })
        res.redirect(redirectUrl + '?emailRecoverCancelled=true');
    } else {
        res.redirect(redirectUrl + '?emailRecoverCancelled=false');
    }
}

