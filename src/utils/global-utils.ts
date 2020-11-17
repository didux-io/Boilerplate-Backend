import * as bcrypt from "bcrypt";
import * as fs from "fs";

export function calculateMinutesDifference(dt2: Date, dt1: Date): number  {
    let diff = (dt2.getTime() - dt1.getTime()) / 1000;
    diff /= 60;
    return Math.abs(Math.round(diff));
}

export async function generatePasswordHash(password: string): Promise<string> {
    const salt = bcrypt.genSaltSync(12); // Amount of rounds 
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
}

export function checkJwtKeys(): boolean {
    const publicJwtKey = fs.existsSync("./jwt-keys/public.pem");
    const privateJwtKey = fs.existsSync("./jwt-keys/private.pem");
    return publicJwtKey && privateJwtKey;
}
