import { Types, Model, Document } from "mongoose";

export interface IUser {
    login: string,
    email: string,
    password: string,
    phone: string,
    emailVerified: boolean,
    role: string,
    purchasedTourIds: Types.ObjectId[] | [],
}

export interface IUserDocument extends IUser, Document {}

export interface IUserModel extends Model<IUserDocument> {}