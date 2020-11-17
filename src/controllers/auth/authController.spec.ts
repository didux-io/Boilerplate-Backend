import request from "supertest";
import { app } from "../../main/server";
import * as web3Utils from "../../utils/web3-utils";
import { Request, Response, NextFunction } from "express";
import { User } from "../../db/models/user";
import { config } from "../../config/config";
import webRtcConfigEnabled from "../../middlewares/webRtcEnabledMiddleware";
import jwt from "jsonwebtoken";
import * as jwtUtils from "../../utils/jwt-utils";

jest.mock("../../middlewares/webRtcEnabledMiddleware", () => jest.fn((req: Request, res: Response, next: NextFunction) => next()));
jest.mock("../../middlewares/jwtMiddleware", () => jest.fn((req: Request, res: Response, next: NextFunction) => next()));

describe("AuthController", () => {

    it("should generate a challenge on getting the auth challenge", async () => {
        spyOn(web3Utils, "publicKeyDoesBelongToDid").and.returnValue(Promise.resolve(true));

        const publicKey = "0x763D47bD6F16A3078c8937A67538C7949B9D0dD1";
        const did = "0x5db9BB3b34444e71054BF460068863B8aeBce8Ab";
        const res = await request(app)
            .get(`/v1/auth/${publicKey}/${did}`)
        expect(res.status).toBe(200)
        expect(res.body).toHaveProperty("challenge")
        expect(res.body).toHaveProperty("publicKey")
        expect(res.body).toHaveProperty("did")
        expect(res.body).toHaveProperty("timestamp")
        expect(res.body).toHaveProperty("loginEndpoint")
        expect(webRtcConfigEnabled).toHaveBeenCalledTimes(1);
    });

    it("should validate the signature and return a JWT token", async () => {
        const publicKey = "0x763D47bD6F16A3078c8937A67538C7949B9D0dD1";
        const did = "0x5db9BB3b34444e71054BF460068863B8aeBce8Ab";

        spyOn(web3Utils, "publicKeyDoesBelongToDid").and.returnValue(Promise.resolve(true));
        spyOn(web3Utils, "isValidCredentials").and.returnValue(Promise.resolve(true));
        spyOn(config.web3.eth.accounts, "recover").and.returnValue(publicKey);
        spyOn(User, "findOne").and.returnValue(true);

        const res = await request(app)
            .post(`/v1/auth/${publicKey}/${did}`)
            .send({ 
                signature: "signature",
                publicKey,
                did,
                timestamp: Math.floor(Date.now() / 1000),
                credentials: "credentials"
            })
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("token");
        expect(webRtcConfigEnabled).toHaveBeenCalledTimes(1);
    });

    it("should check the jwt and send a payload body", async () => {
        jest.mock("fs");

        spyOn(jwt, "verify").and.callFake((var1: unknown, var2: unknown, cb1) => cb1());
        spyOn(jwtUtils, "getClaims").and.returnValue("CLAIMS");

        const res = await request(app).get("/v1/auth/check");
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ payload: "CLAIMS" });
    });

    it("should throw an error on verifying the token", async () => {
        jest.mock("fs");

        const res = await request(app).get("/v1/auth/check");
        expect(res.status).toBe(400);
        expect(res.body).toEqual({ error: "JWT_INVALID" });
    });
})