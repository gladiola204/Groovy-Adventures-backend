import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from 'jsonwebtoken';
import User from "../models/userModel";
import { areDataExist } from "../users/usersController";
import Token from "../models/tokenModel";
import IUser from "../types/user.interface";


export const protection = async (req: Request, res: Response, next: NextFunction) => {
    const { token } = req.body;
        
    areDataExist(res, [req.body, token], "Not authorized, please login", true);

    // Verify token
    const verified = jwt.verify(token, `${process.env.JWT_SECRET}`) as JwtPayload;
    
    if(!verified) {
        res.status(401);
        throw new Error('Token is not verified.');
    };

    const tokenFromDB = await Token.findOne({ token, expiresAt: { $gt: Date.now() } });

    if(!tokenFromDB) {
        res.status(401);
        throw new Error('Invalid or expired token.');
    }

    // Get user id from token
    const user = await User.findById(verified.id).select("-password");

    if(!user) {
        res.status(401);
        throw new Error('User not found');
    };
    if(user._id.toString() !== tokenFromDB.userId.toString()) {
        res.status(401);
        throw new Error('Unauthorized request');
    }
    
    req.user = user;
    next();
};