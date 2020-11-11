import { Request, Response } from "express";
import { User } from "../db/models/user";
import { getJWTToken } from "../utils/token-utils";
import jwt_decode from "jwt-decode";
import { createVerificationCode, sendVerificationEmail } from "../utils/email-utils";
import { generatePasswordHash } from "../utils/global-utils";

export async function createAccount(req: Request, res: Response): Promise<void> {
    const email = req.body.email;
    const password = req.body.password;
    if (!email) {
        res.status(400).send({ error: "Missing email" });
    } else if (!password) {
        res.status(400).send({ error: "Missing password" });
    } else {
        const user = await User.findOne({where: { email }});
        // If the user has any information (setup with mobile WebRTC?)
        if (user) {
            // If the user has any information AND did not yet do the verificationCode steps
            if (!user.emailVerificationCode) {
                const verificationCode = createVerificationCode();
                const hashedPassword = await generatePasswordHash(password);
                await User.update({
                    emailVerificationCode: verificationCode,
                    password: hashedPassword,
                }, {
                    where: { id: user.id }
                });
                sendVerificationEmail(email, verificationCode);
                res.status(200).send({message: "Updated!"});
            } else {
                res.status(400).send({ message: "Email already exists" });
            }
        } else {
            const userCount = await User.count();
            const verificationCode = createVerificationCode();
            const hashedPassword = await generatePasswordHash(password);
            if (userCount === 0) {
                console.log("First time adding a user. Automagically an admin");
                await User.create({
                    email,
                    password: hashedPassword,
                    userPower: 1,
                    emailVerificationCode: verificationCode
                });
            } else {
                await User.create({
                    email,
                    password: hashedPassword,
                    userPower: 100,
                    emailVerificationCode: verificationCode
                });
            }
            sendVerificationEmail(email, verificationCode);
            res.status(200).send({message: "Created!"});
        }
    }
}

export async function patchUserProfile(req: Request, res: Response): Promise<void> {
    try {
        const jwtDecoded: any = jwt_decode(req.headers.authorization);
        await User.update({
            username: req.body.username
        }, {
            where: { id: jwtDecoded.userId }
        });
        const user = await User.findOne({where: { id: jwtDecoded.userId}});
        const token = getJWTToken(user);
        res.status(200).send({token});
    } catch (error) {
        console.error(error);
        res.status(400).send();
    }
}

export async function finishRegistration(req: Request, res: Response): Promise<void> {
    const username = req.body.username;
    const termsAndPrivacyAccepted = req.body.termsAndPrivacyAccepted;
    const newsLetterAccepted = req.body.newsLetterAccepted;
    if (!username) {
        res.status(400).send({ error: "Missing username" });
    } else if (termsAndPrivacyAccepted === "undefined") {
        res.status(400).send({ error: "Missing termsAndPrivacyAccepted" });
    } else if (newsLetterAccepted === "undefined") {
        res.status(400).send({ error: "Missing newsLetterAccepted" });
    } else {
        try {
            const jwtDecoded: any = jwt_decode(req.headers.authorization);
            await User.update({
                username,
                termsAndPrivacyAccepted,
                newsLetterAccepted,
                active: true
            }, {
                where: { id: jwtDecoded.userId }
            });
            const user = await User.findOne({where: { id: jwtDecoded.userId}});
            const token = getJWTToken(user);
            res.status(200).send({token});
        } catch (error) {
            console.error(error);
            res.status(400).send();
        }
    }
}
