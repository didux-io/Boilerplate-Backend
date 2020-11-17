import routes from "../routes/router";
import express, { Application } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import swaggerUi = require("swagger-ui-express");
import swaggerJSDoc from "swagger-jsdoc";
import Web3 from "web3";
import http from "http";
import { config } from "../config/config";
import { Sequelize } from "sequelize-typescript";
import { User } from "../db/models/user";
import { setWeb3Provider } from "../utils/web3-utils";
import { SignalingServer } from "@proofmeid/webrtc-node";
import { checkJwtKeys } from "../utils/global-utils";

// Boot express
export const app: Application = express();

app.disable("x-powered-by");
app.use(cors({ credentials: true, origin: true }));
app.use(bodyParser.json({ limit: "50MB" }));
app.use("/", routes);

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
};

app.use("/doc", swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerDocumentOptions));



config.web3 = new Web3();

export async function startServer(server: http.Server, sequelize: Sequelize): Promise<void> {
    sequelize.addModels([User]);
    await sequelize.sync();
    return new Promise((resolve) => {
        server.listen(port, "0.0.0.0", () => {
            console.log(`${applicationTitle} is running on port ${port} - http://localhost:${port}/doc`);
            resolve();
        });
    });
}

export async function launchApplication(signalServer: SignalingServer, sequelize: Sequelize): Promise<void> {
    const hasJwtKeys = checkJwtKeys();
    if (hasJwtKeys) {
        const server = http.createServer(app)
        signalServer.setRTCConnectionConfig({
            stunEnabled: config.stunEnabled,
            stunUrl: config.stunUrl,
            turnEnabled: config.turnEnabled,
            turnExpiration: config.turnExpiration,
            turnSecret: config.turnSecret,
            turnUrl: config.turnUrl
        });
        signalServer.startSignal(server);
        await setWeb3Provider();
        await startServer(server, sequelize);
    } else {
        console.error("ERROR! Your project did not configure the jwt-keys correctly. Please lookin to the readme and follow the steps in 'Creating RS256 keypair for the JWT'")
    }
}


