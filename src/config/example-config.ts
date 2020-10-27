export const config = {
    // Database
    databaseHost: process.env.DATABASE_HOST || 'DATABASE_HOST',
    databasePort: parseInt(process.env.DATABASE_PORT) || 5432,
    database: process.env.DATABASE || 'DATABASE',
    databaseUser: process.env.DATABASE_USER || 'DATABASE_USER',
    databasePassword: process.env.DATABASE_PASSWORD || 'DATABASE_PASSOWRD',

    // Web3
    web3Host: process.env.WEB3_HOST || 'WEB3_HOST',
    web3: null,

    // Auth
    jwtValidityInSeconds: 86400,
    customer: process.env.CUSTOMER || 'CUSTOM',
    authWsUrl: '',

    // WebRTC
    webRtcEnabled: true,

    // Email
    emailEnabled: true,
    portalBackendBaseUrl: '',
    emailVerificationRedirectUrl: '',
    emailSubject: '',
    emailCc: '',
    emailSender: '',
    emailUser: '',
    emailAppPassword: ''
}
