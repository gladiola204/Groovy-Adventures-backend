import { Types } from "mongoose";

interface IUser {
    _id: Types.ObjectId,
    login: string,
    email: string,
    password: string,
    phone: string,
    emailVerified: boolean,
    createdAt: Date,
    updatedAt: Date,
}

export default IUser;