import { IUserClaims } from "./userClaims.interface";

export interface IJWTDecoded {
    iat: number;
    nbf: number;
    jti: string;
    exp: number;
    identity: string;
    userId: number;
    userPower: number;
    fresh: boolean;
    type: string;
    user_claims: IUserClaims;
}
