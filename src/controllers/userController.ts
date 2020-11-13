import { Request, Response } from "express";
import { User } from "../db/models/user";
import { getJWTToken } from "../utils/token-utils";
import jwt_decode from "jwt-decode";
import { createVerificationCode, sendVerificationEmail } from "../utils/email-utils";
import { generatePasswordHash } from "../utils/global-utils";
import { Op } from "sequelize";

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

export async function usersList(req: Request, res: Response): Promise<void> {
    try {
        const users = await User.findAll();
        res.status(200).send(users);
    } catch (error) {
        console.error(error);
        res.status(400).send();
    }
}

export async function patchUserAdmin(req: Request, res: Response): Promise<void> {
    const userId = req.params.userId
    const email = req.body.email;
    const username = req.body.username;
    const userPower = req.body.userPower;
    const active = req.body.active;
    if (!email) {
        res.status(400).send({ error: "Missing email" });
    } else if (!username) {
        res.status(400).send({ error: "Missing username" });
    } else if (!userPower) {
        res.status(400).send({ error: "Missing userPower" });
    } else if (!active) {
        res.status(400).send({ error: "Missing active" });
    }
    try {
        let notEnoughAdmins = false;
        const userToFind = await User.findOne({where: { id: userId }});
        if (userToFind.userPower !== parseInt(userPower, 10) && parseInt(userPower, 10) !== 1) {
            // Check how many admins there are
            const adminCount = await User.count({ where: {
                userPower: {
                    [Op.eq]: 1 
                }
            }});
            // Are there less or equal than 1 admin
            if (adminCount <= 1) {
                notEnoughAdmins = true;
            }
        }
        if (notEnoughAdmins) {
            res.status(400).send({message: "There has to be atleast one admin"});
        } else {
            await User.update({
                email,
                username,
                userPower,
                active
            }, {
                where: { id: userId }
            });
            const jwtDecoded: any = jwt_decode(req.headers.authorization);
            let token = null;
            if (jwtDecoded.userId === parseInt(userId, 10)) {
                const user = await User.findOne({where: { id: jwtDecoded.userId}});
                token = getJWTToken(user);
            }
            res.status(200).send({token: token});
        }
    } catch (error) {
        console.error(error);
        res.status(400).send();
    }
}
