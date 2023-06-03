import { Request, Response } from 'express';
import checkDataExistence from '../../../utils/validators/checkDataExistence';
import emailValidator from '../../../utils/validators/emailValidator';
import User from '../../../models/userModel';
import generateTokenAndSendEmail from '../utils/generateTokenAndSendEmail';


async function forgotPassword(req: Request, res: Response) {
    const { email } = req.body;

    checkDataExistence(res, [req.body, email], "Please fill in email address", true);

    if(!emailValidator(email)) {
        res.status(400);
        throw new Error("Invalid email address format.")
    }

    const user = await User.findOne({ email });

    if(user === null) {
        res.status(404);
        throw new Error("User not found");
    }

    generateTokenAndSendEmail(req, res, user, "resetPasword");

}

export default forgotPassword;