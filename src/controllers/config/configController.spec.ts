import { app } from "../../main/server";
import request from "supertest";

describe("CONFIG", () => {
    it("should return the config", async () => {
        const res = await request(app)
            .get("/v1/config")
        expect(res.status).toBe(200)
        expect(res.body).toHaveProperty("authWsUrl")
        expect(res.body).toHaveProperty("emailEnabled")
        expect(res.body).toHaveProperty("webRtcEnabled")
    })
})
