import { Request, Response } from 'express';
import checkDataExistence from '../../utils/validators/checkDataExistence';
import User from '../../models/userModel';
import bcryptjs from 'bcryptjs';

async function changePassword(req: Request, res: Response) {
    const { oldPassword, newPassword } = req.body;

    checkDataExistence(res, [oldPassword, newPassword], "Please fill in all required fields", true);

    if(newPassword.length < 6) {
        res.status(400);
        throw new Error("New password must be more than 6 characters.");
    };
    if(oldPassword.length < 6) {
        res.status(400);
        throw new Error("Invalid old password");
    }

    const user = await User.findById(req.user?._id);

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