import { config } from "../config/config";

export async function sendEmail(receiver: string, verificationCode: string) {
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
        subject: config.emailSubject,
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