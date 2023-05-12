import { Request, Response } from "express"
import User from "../models/userModel";
import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';
import Token from "../models/tokenModel";
import sendEmail from "../utils/sendEmail";
import crypto from 'crypto';

const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

const validation = (res: Response, body: {email: string, login:string, password: string}) => {
    const { email, login, password } = body;
    if(!body || !email || !login || !password) {
        res.status(400);
        throw new Error("Please fill in all required fields");
    };
    if(email.trim() === '' || login.trim() === '' || password.trim() === '') {
        res.status(400);
        throw new Error("Please fill in all required fields");
    }
    if(password.length < 6) {
        res.status(400);
        throw new Error("Password must be more than 6 characters");
    }
    if(isValidEmail(email) === false) {
        res.status(400);
        throw new Error("Password must be more than 6 characters");
    }
}

const generateToken = (id: Types.ObjectId) => {
    return jwt.sign({id}, `${process.env.JWT_SECRET}`, {expiresIn: "1d"});
}

export async function registerUser(req: Request, res: Response) {

    const { body } = req;
    const { email, login, password } = body;

    validation(res, body);

    // Check email in database
    const userExists = await User.findOne({email});

    if(userExists) {
        res.status(400);
        throw new Error("Email has already been registered.")
    };

    // Check login in database 
    const loginExists = await User.findOne({login});

    if(loginExists) {
        res.status(400);
        throw new Error("Login is already taken.")
    };

    // Create user
    const user = await User.create({
        email,
        login,
        password
    });

    if(user) {
        const { email, login, _id } = user;

        // Generate confirm email token 
        const confirmEmailToken = generateToken(_id);

        // Save token to DB
        await new Token({
            userId: user._id,
            token: confirmEmailToken,
            expiresAt: Date.now() + 30 * (60 * 1000), // 30 minutes
        }).save();

        // Construct confirmEmail URL 
        const confirmUrl = `${process.env.FRONTEND_URL}confirmEmail/${confirmEmailToken}`;

        // Reset email
        const message = `
            <h2>Hello ${login}</h2>
            <p>Please use the url below to confirm your email.</p>
            <p>This reset link is valid for only 30 minutes.</p>

            <a href=${confirmUrl} clicktracking=off>${confirmUrl}</a>

            <p>Regards...</p>
            <p>Groovy Adventures Team</p>
        `;

        const subject = 'Confirm email - Groovy Adventures';
        const send_to = email;
        const sent_from = process.env.EMAIL_USER as string;

        // Trzeba przetestować, czy bez try catch działa

        try {
            await sendEmail(subject, message, send_to, sent_from);
            res.status(200).json({
                success: true,
                message: "Reset email sent"
            })
        } catch {
            res.status(500);
            throw new Error("Email not sent, please try again")
        };

    } else {
        res.status(400);
        throw new Error("Invalid user data");
    };

};

export async function confirmEmail(req: Request, res: Response) {
    const { token } = req.params;

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
