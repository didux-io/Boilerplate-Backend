import { config } from "../config/config";

export async function sendVerificationEmail(receiver: string, verificationCode: string) {
    const user = config.emailUser;
    const password = config.emailAppPassword;
    const sender = config.emailSender;
    const cc = config.emailCc;

    const verificationUrl = config.portalBackendBaseUrl + '/v1/auth/verifyEmail/' + verificationCode + '/' + encodeURIComponent(config.emailVerificationRedirectUrl);

    const msgBody = "Klik op de onderstaande link op jouw account te activeren<br><br>" +
        "<a href='" + verificationUrl + "'>Account activeren</a>"

    const message = msgBody;

    const send = await require('gmail-send')({
        user: user,                              // Your GMail account used to send emails
        pass: password,                          // Application-specific password
        to: [receiver],
        cc: cc,
        from: sender,                            // from: by default equals to user
        replyTo: sender,                         // replyTo: by default `undefined`
        subject: 'Verficiation code',
        html: message                            // HTML
    });

    send({}, function (err: any, res: any, full: any) {
        if (err) return console.log('* sendEmail() callback returned: err:', err);
        console.log('* sendEmail() callback returned: res:', res);
    });
}

export async function sendRecoveryAccount(receiver: string, recoveryCode: string, cancelRecoveryCode: string) {
    const user = config.emailUser;
    const password = config.emailAppPassword;
    const sender = config.emailSender;
    const cc = config.emailCc;

    const recoveryUrl = config.portalBackendBaseUrl + '/v1/auth/recoverAccount/' + recoveryCode + '/' + encodeURIComponent(config.emailVerificationRedirectUrl);
    const cancelRecoveryUrl = config.portalBackendBaseUrl + '/v1/auth/cancelRecoverAccount/' + cancelRecoveryCode + '/' + encodeURIComponent(config.emailVerificationRedirectUrl);

    const msgBody = "Klik op de onderstaande link op jouw account te herstellen<br><br>" +
        "<a href='" + recoveryUrl + "'>Account herstellen</a> <br><br>" +
        "Klik op de onderstaande link om jouw account herstel te annuleren<br><br>" +
        "<a href='" + cancelRecoveryUrl + "'>Account herstel annuleren</a>"

    const message = msgBody;

    const send = await require('gmail-send')({
        user: user,                              // Your GMail account used to send emails
        pass: password,                          // Application-specific password
        to: [receiver],
        cc: cc,
        from: sender,                            // from: by default equals to user
        replyTo: sender,                         // replyTo: by default `undefined`
        subject: 'Account recovery',
        html: message                            // HTML
    });

    send({}, function (err: any, res: any, full: any) {
        if (err) return console.log('* sendEmail() callback returned: err:', err);
        console.log('* sendEmail() callback returned: res:', res);
    });
}

export function createVerificationCode() {
    const cryptoRandomString = require('crypto-random-string');
    return cryptoRandomString({length: 32, type: 'url-safe'});
}

/**
 * Yes it's the same as the verification code but maybe we want to make it different somehow, keep the functions apart
 */
export function createRecoveryCode() {
    const cryptoRandomString = require('crypto-random-string');
    return cryptoRandomString({length: 32, type: 'url-safe'});
}

/**
 * Yes it's the same as the verification code but maybe we want to make it different somehow, keep the functions apart
 */
export function createRecoveryCancelCode() {
    const cryptoRandomString = require('crypto-random-string');
    return cryptoRandomString({length: 32, type: 'url-safe'});
}
