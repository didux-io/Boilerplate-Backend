import {Table, Column, Model, CreatedAt, UpdatedAt, AllowNull, Unique} from "sequelize-typescript";

@Table
export class User extends Model<User> {

    @AllowNull(false)
    @Unique
    @Column
    email: string;

    @AllowNull(true)
    @Column
    password: string;

    @AllowNull(true)
    @Unique
    @Column
    publicKey: string;

    @AllowNull(true)
    @Unique
    @Column
    did: string;

    @AllowNull(false)
    @Column
    userPower: number;

    @AllowNull(true)
    @Unique
    @Column
    username: string;

    @AllowNull(true)
    @Column
    active: boolean;

    @AllowNull(true)
    @Column
    termsAndPrivacyAccepted: boolean;

    @AllowNull(true)
    @Column
    newsLetterAccepted: boolean;

    @CreatedAt
    @Column
    createdAt: Date;

    @UpdatedAt
    @Column
    updatedAt: Date;

    @AllowNull(true)
    @Column
    emailVerified: boolean;

    @AllowNull(true)
    @Unique
    @Column
    emailVerificationCode: string;

    @AllowNull(true)
    @Unique
    @Column
    accountRecoveryCode: string;

    @AllowNull(true)
    @Unique
    @Column
    accountRecoveryCancelCode: string;

    @AllowNull(true)
    @Column
    accountRecoveryDate: Date;

    @AllowNull(true)
    @Unique
    @Column
    accountRecoveryPublicKey: string;

    @AllowNull(true)
    @Unique
    @Column
    accountRecoveryDid: string;

    @AllowNull(true)
    @Column({
        defaultValue: 'nl'
    })
    lang: string;
}
