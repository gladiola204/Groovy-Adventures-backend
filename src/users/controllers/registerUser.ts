import { Request, Response } from "express";
import checkDataExistence from "../../utils/validators/checkDataExistence";
import User from "../../models/user/userModel";
import generateTokenAndSendEmail from "./utils/generateTokenAndSendEmail";
import validateData from "../../utils/validators/validateData";
import { userValidationSchema } from "../../models/user/userValidationSchema";

async function registerUser(req: Request, res: Response) {
    const { body } = req;
    const { email, login, password } = body;

    checkDataExistence(res, [body, email, login, password], "Please fill in all required fields", true);

    validateData(userValidationSchema, body, res);

    // Check email in database
    const userExists = await User.findOne({email});
    checkDataExistence(res, [userExists], "Email has already been registered.", false);

    // Check login in database 
    const loginExists = await User.findOne({login});
    checkDataExistence(res, [loginExists], "Login is already taken", false);

    // Create user
    const user = await User.create({
        email,
        login,
        password
    });

    if(user) {
        generateTokenAndSendEmail(req, res, user, 'confirmEmail');
    } else {
        res.status(400);
        throw new Error("Invalid user data");
    };

};

export default registerUser;