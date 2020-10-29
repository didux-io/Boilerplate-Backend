import { config } from '../config/config';
import * as jwt from 'jsonwebtoken';
import * as fs from 'fs';
import { User } from '../db/models/user';

export function getJWTToken(user: User): string {
    var privateKey = fs.readFileSync('./jwt-keys/private.pem');
    var token = jwt.sign({ 
        publicKey: user.publicKey,
        did: user.did,
        userId: user.id,
        userPower: user.userPower,
        user_claims: {
            email: user.email,
            username: user.username
        }
    }, 
    privateKey, 
    { 
        algorithm: 'RS256', 
        expiresIn: config.jwtValidityInSeconds,
        audience: 'proofme.id'
    });
    return token;
}

export async function generateChallenge(publicKey: string, did: string, loginEndpoint: string, timestamp: string): Promise<string> {
    const application = config.application_name;
    return `${publicKey}-${did}-${timestamp}-${application}-${loginEndpoint}`;
}
