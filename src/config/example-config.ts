export const config = {
    // Database
    databaseHost: process.env.DATABASE_HOST || 'DATABASE_HOST',
    databasePort: parseInt(process.env.DATABASE_PORT) || 5432,
    database: process.env.DATABASE || 'DATABASE',
    databaseUser: process.env.DATABASE_USER || 'DATABASE_USER',
    databasePassword: process.env.DATABASE_PASSWORD || 'DATABASE_PASSWORD',

    // Web3
    web3Host: process.env.WEB3_HOST || 'https://api-eu.didux.network',
    web3: null,

    // Auth
    jwtValidityInSeconds: 86400,
    customer: process.env.CUSTOMER || 'ProofMe.ID',
    authWsUrl: '',

    // WebRTC
    webRtcEnabled: true,
    stunEnabled: true,
    stunUrl: 'stun.l.google.com:19302',
    turnEnabled: false,
    turnUrl: '',
    turnExpiration: 8400,
    turnSecret: '',

    // Email
    emailEnabled: true,
    portalBackendBaseUrl: '',
    emailVerificationRedirectUrl: '',
    emailCc: '',
    emailSender: '',
    emailUser: '',
    emailAppPassword: '',

    // General
    application_name: '',

    // Account recovery
    accountRecoveryTimeInMinutes: 10
}
