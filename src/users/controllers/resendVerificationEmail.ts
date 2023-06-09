import { Request, Response } from "express";
import checkDataExistence from "../../utils/validators/checkDataExistence";
import User from "../../models/user/userModel";
import generateTokenAndSendEmail from "./utils/generateTokenAndSendEmail";
import validateData from "../../utils/validators/validateData";
import { emailValidation } from "../../models/user/userValidationSchema";

async function resendVerificationEmail(req: Request, res: Response) {
    
    const { body } = req;
    const { email } = body;

    checkDataExistence(res, [body, email], "Please fill in email field", true);
    validateData(emailValidation, body, res);

    const userExists = await User.findOne({ email });

    if(userExists && userExists.emailVerified === false) {
        generateTokenAndSendEmail(req, res, userExists, "confirmEmail");

    } else if (userExists && userExists?.emailVerified === true) {
        res.status(400);
        throw new Error("Email has been already verified."); 
    } else {
        res.status(400);
        throw new Error("User doesn't exist.")
    }
};

export default resendVerificationEmail;