import { Request, Response } from "express";
import IUser from "../../../types/user.interface";
import Token from "../../../models/tokenModel";
import { generateToken } from "../../../utils/tokenUtils";
import sendEmail from "../../../utils/sendEmail";

const generateTokenAndSendEmail = async (req: Request, res: Response, user: IUser, actionType: "confirmEmail" | "resetPasword") => {
    const { email, login, _id } = user;

        // Generate token 
        const token = generateToken(_id);

        // Save token to DB
        await new Token({
            userId: user._id,
            token,
            expiresAt: Date.now() + 30 * (60 * 1000), // 30 minutes
        }).save();

        // Construct confirmEmail / resetPassword URL 
        const url = `${process.env.FRONTEND_URL}${actionType === "confirmEmail" ? 'confirmEmail' : 'resetpassword'}/${token}`;

        // Reset email
        const message = `
            <h2>Hello ${login}</h2>
            <p>Please use the url below to ${actionType === "confirmEmail" ? 'confirm your email' : 'reset your password'}.</p>
            <p>This reset link is valid for only 30 minutes.</p>

            <a href=${url} clicktracking=off>${url}</a>

            <p>Regards...</p>
            <p>Groovy Adventures Team</p>
        `;

        const subject = `${actionType === "confirmEmail" ? 'Confirm Email' : 'Password Reset Request'} - Groovy Adventures`;
        const send_to = email;
        const sent_from = process.env.EMAIL_USER as string;

        // Trzeba przetestować, czy bez try catch działa

        try {
            await sendEmail(subject, message, send_to, sent_from);
            res.status(200).json({
                success: true,
                message: `${actionType === "confirmEmail" ? 'Confirm email' : 'Password Reset Request Email'} sent`
            })
        } catch {
            res.status(500);
            throw new Error("Email not sent, please try again")
        };
}

export default generateTokenAndSendEmail;