import { Request, Response } from 'express';
import User from '../../models/user/userModel';
import validateData from '../../utils/validators/validateData';
import { phoneValidation } from '../../models/user/userValidationSchema';

export async function updateUser(req: Request, res: Response) {
    const { phone } = req.body;

    validateData(phoneValidation, req.body, res);

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