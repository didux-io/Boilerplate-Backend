import { Request, Response } from "express";
import { sendUserContactEmail } from "../../utils/email-utils";
import { config } from "../../config/config";
import superagent from "superagent";


export async function sendContactEmail(req: Request, res: Response): Promise<void> {
    const email = req.body.email;
    const name = req.body.name;
    const message = req.body.message;
    const captchaToken = req.body.captchaToken;

    const captchaSecret = config.reCaptchaSecret;

    if (!email) {
        res.status(400).send({ error: "Missing email" });
    } else if (!name) {
        res.status(400).send({ error: "Missing name" });
    } else if (!message) {
        res.status(400).send({ error: "Missing message" });
    } else if (!captchaToken) {
        res.status(400).send({ error: "Missing captchaToken" });
    } else {
        console.log("captchaToken:", captchaToken);
        console.log("captchaSecret:", captchaSecret);
        const googleResponse = (await superagent.get(`https://www.google.com/recaptcha/api/siteverify?secret=${captchaSecret}&response=${captchaToken}`)).body;
        console.log("googleResponse:", googleResponse.success);
        if (googleResponse.success) {
            sendUserContactEmail(name, message, email);
            res.status(200).send({message: "Email send"});
        } else {
            res.status(400).send({message: "Captcha validation wrong"});
        }
    }
}
