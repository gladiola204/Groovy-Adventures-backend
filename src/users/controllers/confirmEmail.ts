import { Request, Response } from 'express';
import { JwtPayload } from 'jsonwebtoken';
import jwt from 'jsonwebtoken';
import Token from '../../models/tokenModel';
import User from '../../models/user/userModel';

async function confirmEmail(req: Request, res: Response) {
    const { token } = req.params;

    // Verify token
    const verified = jwt.verify(token, `${process.env.JWT_SECRET}`) as JwtPayload;

    if(!verified) {
        res.status(401);
        throw new Error('Token is not verified.');
    };

    const validToken = await Token.findOne({ 
        token,
        expiresAt: { $gt: new Date() } 
    });

    if(validToken) {
        const { userId } = validToken;
        await User.findByIdAndUpdate(userId, {
            emailVerified: true,
        });

        res.status(200).json({
            success: true,
            message: 'Email has been verified, please login',
        });
    } else {
        res.status(400);
        throw new Error("Invalid or expired token")
    }
}

export default confirmEmail;