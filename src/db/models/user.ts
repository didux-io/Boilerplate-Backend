import {Table, Column, Model, CreatedAt, UpdatedAt, AllowNull, ForeignKey, Unique} from 'sequelize-typescript';

@Table
export class User extends Model<User> {

    @AllowNull(false)
    @Column
    email: string;

    @AllowNull(true)
    @Column
    password: string;

    @AllowNull(true)
    @Column
    publicKey: string;

    @AllowNull(true)
    @Column
    did: string;

    @AllowNull(false)
    @Column
    userPower: number;

    @AllowNull(true)
    @Unique
    @Column
    emailVerified: boolean;

    @AllowNull(true)
    @Unique
    @Column
    emailVerificationCode: string;

    @AllowNull(true)
    @Unique
    @Column
    username: string;

    @CreatedAt
    @Column
    createdAt: Date;

    @UpdatedAt
    @Column
    updatedAt: Date;
}
