import { config } from "../config/config";
import { ClaimHolder } from "../smartcontracts/ClaimHolder";

import { abi } from "../smartcontracts/identity";
import { calculateMinutesDifference } from "./global-utils";

export async function setWeb3Provider() {
    console.log("Set web3 provider: " + config.web3Host);
    config.web3.setProvider(config.web3Host);
}

export function recoverAddressFromSignature(message: string, signature: string) {
    return config.web3.eth.accounts.recover(message, signature);
}

export async function checkKeyForDid(contractAddress: string, publicKey: string) {
    try  {
        let contract = new config.web3.eth.Contract(abi, contractAddress);
        let shaAddress = config.web3.utils.sha3(publicKey, {encoding:"hex"});
        return await contract.methods.keyHasPurpose(shaAddress, 2).call().then(
            function(result) {
                return result;
            }).catch(
            function(err: any) {
                console.log("Node response: Could not find contract");
                return false;
            }
        );
    } catch (error) {
        console.log("Something went wrong: " + error);
        return false;
    }
}

function anyUserCredentialSignatureWrong(credentials: any, recoveredAddress: string) {
    for (const key in credentials) {
        if (credentials.hasOwnProperty(key)) {
            const value = credentials[key];
            const credentialHolderKey = value.id.split(':')[2];
            if (credentialHolderKey !== recoveredAddress) {
                return false;
            }
        }
    }
    return true;
}

function anyServerCredentialSignatureWrong(credentials: any) {
    for (const key in credentials) {
        if (credentials.hasOwnProperty(key)) {
            const value = credentials[key];
            const serverSignature = value.proof.signature;
            const credentialServerKey = value.proof.holder;
            const messageWithoutProof = JSON.parse(JSON.stringify(value));
            delete messageWithoutProof.proof;
            const recoveredAddress = config.web3.eth.accounts.recover(JSON.stringify(messageWithoutProof), serverSignature);
            if (credentialServerKey !== recoveredAddress) {
                return false;
            }
        }
    }
    return true;
}

function getSha3Key(key: string) {
    return config.web3.utils.keccak256(key);
}

function knownAddressesContains(list: any[], sha3Key: string, didContractAddress: string) {
    for (const listItem of list) {
        if (listItem.sha3Key === sha3Key && listItem.didContractAddress === didContractAddress) {
            return true;
        }
    }
}

async function getKeyPurpose(keyManagerContract: any, key: string): Promise<string> {
    // Get Events
    if (keyManagerContract.options.address === null) {
        return Promise.resolve('-1');
    } else {
        return await keyManagerContract.methods.getKeyPurpose(key).call();
    }
}

async function anyDidContractKeyWrong(credentials: any) {
    const knownAddresses = [];
    for (const key in credentials) {
        if (credentials.hasOwnProperty(key)) {
            const value = credentials[key];
            const didContractAddress = value.issuer.id.split(':')[2];
            const holderKey = value.proof.holder;
            const sha3Key = getSha3Key(holderKey);
            // const web3 = new Web3('https://api.didux.network/');
            const keyManagerContract = new config.web3.eth.Contract(
                ClaimHolder.abi,
                didContractAddress
            );
            if (!knownAddressesContains(knownAddresses, sha3Key, didContractAddress)) {
                const keyPurpose = parseInt(await getKeyPurpose(keyManagerContract, sha3Key), 10);
                if (keyPurpose !== 3) {
                    return false;
                }
                knownAddresses.push({sha3Key, didContractAddress});
            }
        }
    }
    return true;
}

export async function isValidCredentials(credentials: any): Promise<boolean> {
    const now = new Date();
    const then =  new Date(credentials.signedOn);
    const minutesDifference = calculateMinutesDifference(now, then);
    // Check if the timestamp is in the time range
    if (minutesDifference <= 5) {
        // tslint:disable-next-line: max-line-length
        const recoveredAddress = config.web3.eth.accounts.recover(JSON.stringify(credentials.credential), credentials.proof.signature);
        // console.log('credentials.credential:', credentials.credential);
        // console.log('recoveredAddress:', recoveredAddress);
        const userSignatureResult = anyUserCredentialSignatureWrong(credentials.credential, recoveredAddress);
        // Check if the user (Identity App) did sign it correct
        if (userSignatureResult) {
            // tslint:disable-next-line: max-line-length
            // Check if the sent credentials were provided by the did of the credential (check the signature of each credential)
            const issuerSignaturesResult = anyServerCredentialSignatureWrong(credentials.credential);
            // console.log('issuerSignaturesResult:', issuerSignaturesResult);
            if (issuerSignaturesResult) {
                // console.log('Identify credentials:', credentials);
                // Check every credential DID contract if the holder belongs to that DID
                const didContractKeyResult = await anyDidContractKeyWrong(credentials.credential);
                if (didContractKeyResult) {
                    // So all good, check identification
                    return true;
                } else {
                    console.error('4. ERROR isValidCredentials');
                    // Vertrouwde ondertekenaar klopt niet
                    return false;
                }
            } else {
                console.error('3. ERROR isValidCredentials');
                // Server handtekening klopt niet
                return false;
            }
        } else {
            console.error('2. ERROR isValidCredentials');
            // Handtekening klopt niet
            return false;
        }
    } else {
        console.error('1. ERROR isValidCredentials');
        // Datum klopt niet
        return false;
    }
}
