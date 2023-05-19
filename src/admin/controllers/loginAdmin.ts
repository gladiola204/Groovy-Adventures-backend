import { Request, Response } from "express";
import Token from "../../models/tokenModel";
import User from "../../models/userModel";
import IUser from "../../types/user.interface";
import { generateToken } from "../../utils/tokenUtils";
import checkDataExistence from "../../utils/validators/checkDataExistence";
import emailValidator from "../../utils/validators/emailValidator";
import bcryptjs from 'bcryptjs';

async function loginAdmin(req: Request, res: Response) {
    const { body } = req;
    const { email, password } = body;

    checkDataExistence(res, [body, email, password], "Please fill in all required fields", true);

    if(password.length < 6) {
        res.status(400);
        throw new Error("Invalid password or email");
    };

    if(!emailValidator(email)) {
        res.status(400);
        throw new Error("Invalid email address format.");
    };

    const userExists: IUser | null = await User.findOne({ email });

    if(userExists === null) {
        res.status(400);
        throw new Error("User doesn't exist. Please sign up.")
    }
    const { _id, emailVerified, login, role } = userExists;

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

    const token = generateToken(_id, 'admin');

    // Save token to DB
    await new Token({
        userId: _id,
        token,
        expiresAt: Date.now() + (1 * 60 * 60 * 1000), // 1 hour
    }).save();

    res.status(200).json({
        _id, login, email, token, role
    });
};

export default loginAdmin;