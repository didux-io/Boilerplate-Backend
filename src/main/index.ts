import { SignalingServer } from "@proofmeid/webrtc-node";
import { launchApplication } from "./server";
import { Sequelize } from "sequelize-typescript";
import { config } from "../config/config";

const signalServer = new SignalingServer();
const sequelizeDb = new Sequelize({
    host: config.databaseHost || "localhost",
    port: config.databasePort || 5432,
    database: config.database || "postgres",
    dialect: "postgres",
    username: config.databaseUser || "postgres",
    password: config.databasePassword || "mysecretpassword",
    logging: false,
});
launchApplication(signalServer, sequelizeDb);

