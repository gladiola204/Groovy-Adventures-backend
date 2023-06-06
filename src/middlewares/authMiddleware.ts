import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from 'jsonwebtoken';
import User from "../models/user/userModel";
import Token from "../models/tokenModel";


export const protection = async (req: Request, res: Response, next: NextFunction, allowedRoles: string[]) => {
    const { authorization: authorizationHeader } = req.headers;
    const token = authorizationHeader?.split(' ')[1];
    
    if (!token) {
        res.status(400);
        throw new Error('Missing or invalid authorization token.');
    }
        
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
    };

    if (!allowedRoles.includes(user.role)) {
        res.status(403);
        throw new Error('Access denied');
    };

    if(user.role === "admin") {
        req.admin = user;
    } else {
        req.user = user;
    };
    
    next();
};