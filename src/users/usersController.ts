import { Request, Response } from "express"
import User from "../models/userModel";
import jwt, { JwtPayload } from 'jsonwebtoken';
import { Types } from 'mongoose';
import Token from "../models/tokenModel";
import sendEmail from "../utils/sendEmail";
import bcryptjs from 'bcryptjs';
import IUser from "../types/user.interface";

const isValidEmail = (email: string) => {
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    return emailRegex.test(email);
}

const validation = (res: Response, body: {email: string, login:string, password: string}) => {
    const { email, login, password } = body;

    areDataExist(res, [body, email, login, password], "Please fill in all required fields", true);

    if(email.trim() === '' || login.trim() === '' || password.trim() === '') {
        res.status(400);
        throw new Error("Please fill in all required fields");
    }
    if(password.length < 6) {
        res.status(400);
        throw new Error("Password must be more than 6 characters");
    };

    if(!isValidEmail(email)) {
        res.status(400);
        throw new Error("Invalid email address format.");
    }
};

export const areDataExist = (res: Response, data: Array<Object | string | boolean | null>, message: string, shouldExist: boolean) => {
    const foundData = data.every(item => item !== null && item !== undefined);

    if ((foundData && !shouldExist) || (!foundData && shouldExist)) {
        res.status(400);
        throw new Error(message);
  }
}

const generateToken = (id: Types.ObjectId) => {
    return jwt.sign({id}, `${process.env.JWT_SECRET}`, {expiresIn: "1d"});
}

const verificationTokenAndEmail = async (req: Request, res: Response, user: IUser) => {
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
                message: "Confirmation email sent"
            })
        } catch {
            res.status(500);
            throw new Error("Email not sent, please try again")
        };
}

export async function registerUser(req: Request, res: Response) {
    const { body } = req;
    const { email, login, password } = body;

    validation(res, body);

    // Check email in database
    const userExists = await User.findOne({email});
    
    areDataExist(res, [userExists], "Email has already been registered.", false);

    // Check login in database 
    const loginExists = await User.findOne({login});

    areDataExist(res, [loginExists], "Login is already taken", false);

    // Create user
    const user = await User.create({
        email,
        login,
        password
    });

    if(user) {
        verificationTokenAndEmail(req, res, user);
    } else {
        res.status(400);
        throw new Error("Invalid user data");
    };

};

export async function confirmEmail(req: Request, res: Response) {
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

export async function resendVerificationEmail(req: Request, res: Response) {
    
    const { body } = req;
    const { email } = body;

    areDataExist(res, [body, email], "Please fill in email field", true);

    if(!isValidEmail(email)) {
        res.status(400);
        throw new Error("Invalid email address format.");
    }

    const userExists = await User.findOne({ email });

    if(userExists && userExists.emailVerified === false) {
        verificationTokenAndEmail(req, res, userExists);

    } else if (userExists && userExists?.emailVerified === true) {
        res.status(400);
        throw new Error("Email has been already verified."); 
    } else {
        res.status(400);
        throw new Error("User doesn't exist.")
    }
};

export async function loginUser(req: Request, res: Response) {
    const { body } = req;
    const { email, password } = body;

    areDataExist(res, [body, email, password], "Please fill in all required fields", true);

    if(password.length < 6) {
        res.status(400);
        throw new Error("Invalid password or email");
    };

    if(!isValidEmail(email)) {
        res.status(400);
        throw new Error("Invalid email address format.");
    };

    const userExists: IUser | null = await User.findOne({ email });

    if(userExists === null) {
        res.status(400);
        throw new Error("User doesn't exist. Please sign up.")
    }
    const { _id, emailVerified, login, phone } = userExists;

    // Check if password is correct
    const isPasswordCorrect = await bcryptjs.compare(password, userExists.password);
    if(isPasswordCorrect === false) {
        res.status(400);
        throw new Error("Invalid email or password.");
    }

    if(emailVerified === false) {
        res.status(401);
        throw new Error("Email has not yet been verified. Verify it to be able to log in")
    };

    const token = generateToken(_id);

    // Save token to DB
    await new Token({
        userId: _id,
        token,
        expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
    }).save();

    res.status(200).json({
        _id, login, email, phone, token,
    });
};

export async function logoutUser(req: Request, res: Response) {
    const { token } = req.body;
    console.log("Jestem tutaj");

    await Token.deleteOne({ token });

    res.status(200).json({
        success: true,
        message: "User logged out."
    })
};