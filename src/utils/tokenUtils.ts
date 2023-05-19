import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';

export const generateToken = (id: Types.ObjectId, role?: "admin") => {
    if(role === 'admin') {
        return jwt.sign({id}, `${process.env.JWT_SECRET}`, {expiresIn: "1h"});
    } else {
        return jwt.sign({id}, `${process.env.JWT_SECRET}`, {expiresIn: "1d"});
    }
};