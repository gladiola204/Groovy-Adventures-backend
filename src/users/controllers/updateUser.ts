import { Request, Response } from 'express';
import checkDataExistence from '../../utils/validators/checkDataExistence';
import User from '../../models/user/userModel';

export async function updateUser(req: Request, res: Response) {
    const { phone } = req.body;

    checkDataExistence(res, [phone], "Phone field is empty", true);

    if(!phone.startsWith('+')) {
        res.status(400);
        throw new Error("Invalid phone number format")
    };

    const updatedUser = await User.findByIdAndUpdate(req.user?._id, { phone });

    if(updatedUser) {
        res.status(200).json({
            phone,
        });
    } else {
        res.status(404);
        throw new Error("User not found");
    };
};