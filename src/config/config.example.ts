export const config = {
    // Database
    databaseHost: process.env.DATABASE_HOST || "localhost",
    databasePort: parseInt(process.env.DATABASE_PORT) || 5432,
    database: process.env.DATABASE || "DB_NAME",
    databaseUser: process.env.DATABASE_USER || "DB_USER",
    databasePassword: process.env.DATABASE_PASSWORD || "DB_PASSWORD",

    // Web3
    web3Host: process.env.WEB3_HOST || "https://api.didux.network",
    web3: null,

    // Auth
    jwtValidityInSeconds: 86400,
    authWsUrl: process.env.AUTH_WS_URL || "ws://localhost:4015",

    // WebRTC
    webRtcEnabled: true,
    stunEnabled: true,
    stunUrl: "stun:stun.l.google.com:19302",
    turnEnabled: false,
    turnUrl: "",
    turnExpiration: 8400,
    turnSecret: "",

    // Email
    emailEnabled: false,
    portalBackendBaseUrl: process.env.BACKEND_URL || "http://localhost:4015",
    emailVerificationRedirectUrl: "",
    emailSubject: "",
    emailCc: "",
    emailSender: "",
    emailUser: "",
    emailAppPassword: "",

    // Socials
    twitterUrl: "",
    linkedInUrl: "",
    facebookUrl: "",

    // General
    application_name: process.env.APPLICATION || "APPLICATION_NAME",
    application_description: "APPLICATION DESCRIPTION",
    application_url: "https://www.example.com",

    // Account recovery
    accountRecoveryTimeInMinutes: 10,

    // reCaptcha
    reCaptchaSecret: null,
    contactEmail: null
}
