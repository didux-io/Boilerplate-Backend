import * as bcrypt from "bcrypt";

export function calculateMinutesDifference(dt2: Date, dt1: Date)  {
    let diff = (dt2.getTime() - dt1.getTime()) / 1000;
    diff /= 60;
    return Math.abs(Math.round(diff));
}

export async function generatePasswordHash(password: string) {
    const salt = bcrypt.genSaltSync(12); // Amount of rounds 
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
}
