import routes from "../routes/indexVersion";
import * as express from 'express';
import * as cors from 'cors';
import swaggerUi = require('swagger-ui-express');
import swaggerJSDoc = require('swagger-jsdoc');
import bodyParser = require("body-parser");
import { config } from "../config/config";
import * as Web3 from '@smilo-platform/web3';
import * as fs from "fs";
import * as http from "http";
import { Sequelize } from 'sequelize-typescript';
import { User } from "../db/models/user";
import { setWeb3Provider } from "../utils/web3-utils";
import { SignalingServer } from "../signaling/signalingServer";
import { sendEmail } from "../utils/email-utils";

const app = express();
const applicationTitle = config.application_name;
const port = parseInt(process.env.PORT || '4015');
const swaggerSpec = swaggerJSDoc({
    swaggerDefinition: {
        info: {
            title: applicationTitle,
            version: '1.0.0'
        },
        basePath: '/v1',
        securityDefinitions: {
            Bearer: {
                type: 'apiKey',
                name: 'authorization',
                in: 'header',
                scheme: 'bearer',
                bearerFormat: 'JWT',
            }
        },
    },
    apis: ["**/*.ts"],
});
const swaggerDocumentOptions = {
    // customCss: '.swagger-ui .scheme-container { display: none; }'
};

app.use(cors({ credentials: true, origin: true }));
app.use(bodyParser.json({ limit: '50MB' }));
app.use('/documentation', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerDocumentOptions));
app.use("/", routes);

const server = http.createServer(app)
const signal = new SignalingServer();
signal.startSignal(server);

const sequelize = new Sequelize({
    host: config.databaseHost || 'localhost',
    port: config.databasePort || 5432,
    database: config.database || 'postgres',
    dialect: 'postgres',
    username: config.databaseUser || 'postgres',
    password: config.databasePassword || 'mysecretpassword',
    logging: false,
});

config.web3 = new Web3();
launchApplication();

function startServer() {
    sequelize.addModels([User]);
    sequelize.sync().then(() => {
        server.listen(port, "0.0.0.0", () => {
            console.log(`${applicationTitle} is running on port ${port}`);
        });
    });
}

async function launchApplication() {
    await setWeb3Provider();
    startServer();
}
