import { config } from "../config/config";
import gmail from "gmail-send";
import crypto from "crypto-random-string";

export async function sendVerificationEmail(receiver: string, verificationCode: string, lang: string): Promise<void> {
    const user = config.emailUser;
    const password = config.emailAppPassword;
    const sender = config.emailSender;
    const cc = config.emailCc;

    const language = [
        {lang: "nl", subject: "Account verifiëren", greeting: "Beste", text: "Klik op de onderstaande link om jouw account te activeren.", button: "Account activeren"},
        {lang: "en", subject: "Account verify", greeting: "Dear", text: "Click on the link below to activate your account.", button: "Activate account"}
    ];

    const verificationUrl = config.portalBackendBaseUrl + "/v1/auth/verifyEmail/" + verificationCode + "/" + encodeURIComponent(config.emailVerificationRedirectUrl);

    const swig = require('swig');
    const verificationTemplate = swig.renderFile('src/templates/verificationTemplate.html', {
        user: user,
        application_name: config.application_name,
        application_url: config.application_url,
        twitterUrl: config.twitterUrl,
        linkedInUrl: config.linkedInUrl,
        facebookUrl: config.facebookUrl,
        verificationUrl: verificationUrl,
        language: language.find(e => e.lang === lang)
    });

    const message = verificationTemplate;

    /* eslint @typescript-eslint/no-var-requires: 1 */
    const send = await gmail({
        user: user,                              // Your GMail account used to send emails
        pass: password,                          // Application-specific password
        to: [receiver],
        cc: cc,
        from: sender,                            // from: by default equals to user
        replyTo: sender,                         // replyTo: by default `undefined`
        subject: language.find(e => e.lang === lang).subject,
        html: message                            // HTML
    });

    send({}, function (err: unknown, res: unknown) {
        if (err) return console.log("* sendEmail() callback returned: err:", err);
        console.log("* sendEmail() callback returned: res:", res);
    });
}

export async function sendRecoveryAccount(receiver: string, recoveryCode: string, cancelRecoveryCode: string, lang: string): Promise<void> {
    const user = config.emailUser;
    const password = config.emailAppPassword;
    const sender = config.emailSender;
    const cc = config.emailCc;

    const language = [
        {lang: "nl", subject: "Account herstellen", greeting: "Beste", text: "Klik op de onderstaande link om jouw account te herstellen.", text_cancel: "Klik op de onderstaande link om jouw account herstel te annuleren.", button: "Account herstellen", button_cancel: "Account herstel annuleren"},
        {lang: "en", subject: "Account recovery", greeting: "Dear", text: "Click on the link below to recover your account", text_cancel: "Click on the link below to cancel your account recovery.", button: "Recover account", button_cancel: "Cancel account recovery"}
    ];

    const recoveryUrl = config.portalBackendBaseUrl + "/v1/auth/recoverAccount/" + recoveryCode + "/" + encodeURIComponent(config.emailVerificationRedirectUrl);
    const cancelRecoveryUrl = config.portalBackendBaseUrl + "/v1/auth/cancelRecoverAccount/" + cancelRecoveryCode + "/" + encodeURIComponent(config.emailVerificationRedirectUrl);

    const swig = require('swig');
    const recoveryTemplate = swig.renderFile('src/templates/recoveryTemplate.html', {
        user: user,
        application_name: config.application_name,
        application_url: config.application_url,
        twitterUrl: config.twitterUrl,
        linkedInUrl: config.linkedInUrl,
        facebookUrl: config.facebookUrl,
        recoveryUrl: recoveryUrl,
        cancelRecoveryUrl: cancelRecoveryUrl,
        language: language.find(e => e.lang === lang)
    });

    //const message = msgBody;
    const message = recoveryTemplate;

    /* eslint @typescript-eslint/no-var-requires: 1 */
    const send = await gmail({
        user: user,                              // Your GMail account used to send emails
        pass: password,                          // Application-specific password
        to: [receiver],
        cc: cc,
        from: sender,                            // from: by default equals to user
        replyTo: sender,                         // replyTo: by default `undefined`
        subject: language.find(e => e.lang === lang).subject,
        html: message                            // HTML
    });

    send({}, function (err: unknown, res: unknown) {
        if (err) return console.log("* sendEmail() callback returned: err:", err);
        console.log("* sendEmail() callback returned: res:", res);
    });
}

export function createVerificationCode(): string {
    /* eslint @typescript-eslint/no-var-requires: 1 */
    const cryptoRandomString = crypto;
    return cryptoRandomString({length: 32, type: "url-safe"});
}

/**
 * Yes it's the same as the verification code but maybe we want to make it different somehow, keep the functions apart
 */
export function createRecoveryCode(): string {
    /* eslint @typescript-eslint/no-var-requires: 1 */
    const cryptoRandomString = crypto;
    return cryptoRandomString({length: 32, type: "url-safe"});
}

/**
 * Yes it's the same as the verification code but maybe we want to make it different somehow, keep the functions apart
 */
export function createRecoveryCancelCode(): string {
    /* eslint @typescript-eslint/no-var-requires: 1 */
    const cryptoRandomString = crypto;
    return cryptoRandomString({length: 32, type: "url-safe"});
}

export async function sendUserContactEmail(name: string, userMessage: string, userEmail: string): Promise<void> {
    const user = config.emailUser;
    const password = config.emailAppPassword;
    const cc = config.emailCc;

    const language = [
        {lang: "nl", subject: "Contact", greeting: "Beste", text: "heeft een bericht gestuurd:"},
        {lang: "en", subject: "Contact", greeting: "Dear", text: "sent a message:"}
    ];

    const swig = require('swig');
    const contactTemplate = swig.renderFile('src/templates/contactTemplate.html', {
        user: user,
        application_name: config.application_name,
        application_url: config.application_url,
        twitterUrl: config.twitterUrl,
        linkedInUrl: config.linkedInUrl,
        facebookUrl: config.facebookUrl,
        name: name,
        userMessage: userMessage,
        language: language.find(e => e.lang === 'en')
    });

    const message = contactTemplate;

    const send = await gmail({
        user: user,                              // Your GMail account used to send emails
        pass: password,                          // Application-specific password
        to: config.contactEmail,
        cc: cc,
        from: userEmail,                            // from: by default equals to user
        replyTo: userEmail,                         // replyTo: by default `undefined`
        subject: language.find(e => e.lang === 'en').subject,
        html: message                            // HTML
    });

    send({}, function (err: unknown, res: unknown) {
        if (err) return console.log("* sendContactEmail() callback returned: err:", err);
        console.log("* sendContactEmail() callback returned: res:", res);
    });
}
