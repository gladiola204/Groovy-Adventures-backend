import { Request, Response } from 'express';
import checkDataExistence from '../../../utils/validators/checkDataExistence';
import User from '../../../models/user/userModel';
import generateTokenAndSendEmail from '../utils/generateTokenAndSendEmail';
import validateData from '../../../utils/validators/validateData';
import { emailValidation } from '../../../models/user/userValidationSchema';


async function forgotPassword(req: Request, res: Response) {
    const { email } = req.body;

    checkDataExistence(res, [req.body, email], "Please fill in email address", true);
    validateData(emailValidation, req.body, res);

    const user = await User.findOne({ email });

    if(user === null) {
        res.status(404);
        throw new Error("User not found");
    }

    generateTokenAndSendEmail(req, res, user, "resetPasword");

}

export default forgotPassword;