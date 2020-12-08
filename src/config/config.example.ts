export const config = {
    // Database
    databaseHost: process.env.DATABASE_HOST || "localhost",
    databasePort: process.env.DATABASE_PORT ? parseInt(process.env.DATABASE_PORT, 10) : 5432,
    database: process.env.DATABASE || "DB_NAME",
    databaseUser: process.env.DATABASE_USER || "DB_USER",
    databasePassword: process.env.DATABASE_PASSWORD || "DB_PASSWORD",

    // Web3
    web3Host: process.env.WEB3_HOST || "https://api.didux.network",
    web3: null,

    // Auth
    jwtValidityInSeconds: process.env.JWT_VALIDITY ? parseInt(process.env.JWT_VALIDITY, 10) : 86400,
    authWsUrl: process.env.AUTH_WS_URL || "",

    // WebRTC
    webRtcEnabled: process.env.WEBRTC_ENABLED ? (process.env.WEBRTC_ENABLED === "true") : true,
    stunEnabled: process.env.STUN_ENABLED ? (process.env.STUN_ENABLED === "true") : true,
    stunUrl: process.env.STUN_URL || "stun:stun.l.google.com:19302",
    turnEnabled: process.env.TURN_ENABLED ? (process.env.TURN_ENABLED === "true") : false,
    turnUrl: process.env.TURN_URL || "",
    turnExpiration: process.env.TURN_EXPIRATION ? parseInt(process.env.TURN_EXPIRATION, 10) : 8400,
    turnSecret: process.env.TURN_SECRET || "",

    // Email
    emailEnabled: process.env.EMAIL_ENABLED ? (process.env.EMAIL_ENABLED === "true") : false,
    portalBackendBaseUrl: process.env.BASE_URL || "",
    emailVerificationRedirectUrl: process.env.REDIRECT_URL || "",
    emailSubject: process.env.EMAIL_SUBJECT || "",
    emailCc: process.env.EMAIL_CC || "",
    emailSender: process.env.EMAIL_SENDER || "",
    emailUser: process.env.EMAIL_USER || "",
    emailAppPassword: process.env.EMAIL_PASSWORD || "",

    // Socials
    twitterUrl: process.env.TWITTER_URL || "",
    linkedInUrl: process.env.LINKEDIN_URL || "",
    facebookUrl: process.env.FACEBOOK_URL || "",

    // General
    application_name: process.env.APPLICATION || "APPLICATION_NAME",
    application_description: process.env.APPLICATION_DESCRIPTION || "APPLICATION DESCRIPTION",
    application_url: process.env.APPLICATION_URL || "https://www.example.com",

    // Account recovery
    accountRecoveryTimeInMinutes: 10,

    // reCaptcha
    reCaptchaSecret: process.env.RECAPTCHA || null,
    contactEmail: process.env.EMAIL || null
}

