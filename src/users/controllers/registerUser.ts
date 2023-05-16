import { Request, Response } from "express";
import checkDataExistence from "../../utils/validators/checkDataExistence";
import emailValidator from "../../utils/validators/emailValidator";
import User from "../../models/userModel";
import generateTokenAndSendEmail from "./utils/generateTokenAndSendEmail";

async function registerUser(req: Request, res: Response) {
    const { body } = req;
    const { email, login, password } = body;

    checkDataExistence(res, [body, email, login, password], "Please fill in all required fields", true);

    if(login.trim() === '' || password.trim() === '') {
        res.status(400);
        throw new Error("Please fill in all required fields");
    }
    if(password.length < 6) {
        res.status(400);
        throw new Error("Password must be more than 6 characters");
    };

    if(!emailValidator(email)) {
        res.status(400);
        throw new Error("Invalid email address format.");
    }

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