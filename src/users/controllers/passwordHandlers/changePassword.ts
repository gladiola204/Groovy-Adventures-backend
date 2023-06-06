import { Request, Response } from 'express';
import checkDataExistence from '../../../utils/validators/checkDataExistence';
import User from '../../../models/user/userModel';
import bcryptjs from 'bcryptjs';
import { IUserDocument } from '../../../types/user.interface';
import validateData from '../../../utils/validators/validateData';
import { passwordValidation } from '../../../models/user/userValidationSchema';

async function changePassword(req: Request, res: Response) {
    const { oldPassword, newPassword } = req.body;
    let user: IUserDocument | null;

    checkDataExistence(res, [oldPassword, newPassword], "Please fill in all required fields", true);

    validateData(passwordValidation, { newPassword }, res);
    
    if(oldPassword.length < 6) {
        res.status(400);
        throw new Error("Invalid old password");
    }

    if(req.admin) {
        user = await User.findById(req.admin?._id);
    } else {
        user = await User.findById(req.user?._id);
    };
    
    if(user === null) {
        res.status(404);
        throw new Error("User not found");
    };

    const isPasswordCorrect = await bcryptjs.compare(oldPassword, user.password);

    if(isPasswordCorrect === false) {
        res.status(400);
        throw new Error("Invalid old password");
    };

    user.password = newPassword;
    await user.save();

    res.status(200).json({
        success: true,
        message: "Password has been changed successfully."
    });
}

export default changePassword;