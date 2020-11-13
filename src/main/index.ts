
import swaggerUi = require("swagger-ui-express");
import swaggerJSDoc from "swagger-jsdoc";

import Web3 from "web3";
import http from "http";
import { config } from "../config/config";
import { Sequelize } from "sequelize-typescript";
import { User } from "../db/models/user";
import { setWeb3Provider } from "../utils/web3-utils";
import { SignalingServer } from "@proofmeid/webrtc-node";
import * as fs from 'fs';
import { app } from "./server";

const applicationTitle = config.application_name;
const applicationDescription = config.application_description;
const port = parseInt(process.env.PORT || "4015");
const swaggerSpec = swaggerJSDoc({
    swaggerDefinition: {
        info: {
            title: applicationTitle,
            version: "1.0.0",
            description: applicationDescription
        },
        basePath: "/v1",
        securityDefinitions: {
            Bearer: {
                type: "apiKey",
                name: "authorization",
                in: "header",
                scheme: "bearer",
                bearerFormat: "JWT",
            }
        },
    },
    apis: ["**/*.ts"],
});
const swaggerDocumentOptions = {
    customCss: ".topbar  { display: none; }"
    // .swagger-ui .scheme-container { display: none; }
};

app.use("/doc", swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerDocumentOptions));

const server = http.createServer(app)
const signal = new SignalingServer();
signal.setRTCConnectionConfig({
    stunEnabled: config.stunEnabled,
    stunUrl: config.stunUrl,
    turnEnabled: config.turnEnabled,
    turnExpiration: config.turnExpiration,
    turnSecret: config.turnSecret,
    turnUrl: config.turnUrl
})

const sequelize = new Sequelize({
    host: config.databaseHost || "localhost",
    port: config.databasePort || 5432,
    database: config.database || "postgres",
    dialect: "postgres",
    username: config.databaseUser || "postgres",
    password: config.databasePassword || "mysecretpassword",
    logging: false,
});

function checkJwtKeys(): boolean {
    const publicJwtKey = fs.existsSync('./jwt-keys/public.pem');
    const privateJwtKey = fs.existsSync('./jwt-keys/private.pem');
    return publicJwtKey && privateJwtKey;
}

config.web3 = new Web3();
launchApplication();

function startServer() {
    sequelize.addModels([User]);
    sequelize.sync().then(() => {
        server.listen(port, "0.0.0.0", () => {
            console.log(`${applicationTitle} is running on port ${port} - http://localhost:${port}/doc`);
        });
    });
}

async function launchApplication() {
    const hasJwtKeys = checkJwtKeys();
    if (hasJwtKeys) {
        signal.startSignal(server);
        await setWeb3Provider();
        startServer();
    } else {
        console.error(`ERROR! Your project did not configure the jwt-keys correctly. Please lookin to the readme and follow the steps in 'Creating RS256 keypair for the JWT'`)
    }
}
