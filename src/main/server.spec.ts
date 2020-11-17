import { SignalingServer } from "@proofmeid/webrtc-node";
import { Sequelize } from "sequelize-typescript";
import { app, launchApplication, startServer } from "./server";
import { config } from "../config/config";
import http from "http";
import * as jwt from "../utils/global-utils";

jest.mock("@proofmeid/webrtc-node");

describe("Server", () => {

    it("should start the http server", async () => {
        const sequelize = new Sequelize({dialect: "postgres"});
        spyOn(sequelize, "sync");

        const server = http.createServer(app)
        spyOn(server, "listen").and.callFake((var1: unknown, var2: unknown, cb1) => cb1());
        
        await startServer(server, sequelize);
        expect(server.listen).toHaveBeenCalled();
    })
    
    it("should start the signaling server", async () => {
        spyOn(http, "createServer").and.returnValue({listen: (cb1: number, cb2: string, cb3: () => void) => { cb3(); }});
        spyOn(jwt, "checkJwtKeys").and.returnValue(true);
        const signalingServer = new SignalingServer();
        const sequelize = new Sequelize({dialect: "postgres"});
        spyOn(signalingServer, "startSignal");
        spyOn(sequelize, "sync");
        
        await launchApplication(signalingServer, sequelize);
        expect(signalingServer.startSignal).toHaveBeenCalled();
    })

    it("should start the sequelize connection", async () => {
        spyOn(http, "createServer").and.returnValue({listen: (cb1: number, cb2: string, cb3: () => void) => { cb3(); }});
        spyOn(jwt, "checkJwtKeys").and.returnValue(true);

        const signalingServer = new SignalingServer();
        const sequelize = new Sequelize({dialect: "postgres"});
        spyOn(signalingServer, "startSignal");
        spyOn(sequelize, "sync");

        const server = http.createServer(app);
        await startServer(server, sequelize);

        expect(sequelize.sync).toHaveBeenCalled();
    });

    it("should call the signaling config by the config file", async () => {
        spyOn(http, "createServer").and.returnValue({listen: (cb1: number, cb2: string, cb3: () => void) => { cb3(); }});
        spyOn(jwt, "checkJwtKeys").and.returnValue(true);
        const signalingServer = new SignalingServer();
        const sequelize = new Sequelize({dialect: "postgres"});
        spyOn(signalingServer, "startSignal");
        spyOn(sequelize, "sync");
        
        await launchApplication(signalingServer, sequelize);

        const signalConfig = {
            stunEnabled: config.stunEnabled,
            stunUrl: config.stunUrl,
            turnEnabled: config.turnEnabled,
            turnExpiration: config.turnExpiration,
            turnSecret: config.turnSecret,
            turnUrl: config.turnUrl
        };
        expect(signalingServer.setRTCConnectionConfig).toHaveBeenCalledWith(signalConfig);
    });

    it("should not start the signal server, http server and sequelize connection when the jwt keys are not defined", () => {
        spyOn(http, "createServer").and.returnValue({listen: (cb1: number, cb2: string, cb3: () => void) => { cb3(); }});
        spyOn(jwt, "checkJwtKeys").and.returnValue(false);

        const signalingServer = new SignalingServer();
        const sequelize = new Sequelize({dialect: "postgres"});
        spyOn(signalingServer, "startSignal");
        spyOn(sequelize, "sync");

        expect(sequelize.sync).not.toHaveBeenCalled();
        expect(signalingServer.startSignal).not.toHaveBeenCalled();
    });
})
