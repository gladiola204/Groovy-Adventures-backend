import { Request, Response } from 'express';
import checkDataExistence from '../../../utils/validators/checkDataExistence';
import jwt, { JwtPayload } from 'jsonwebtoken';
import Token from '../../../models/tokenModel';
import User from '../../../models/user/userModel';
import validateData from '../../../utils/validators/validateData';
import { passwordValidation } from '../../../models/user/userValidationSchema';


async function resetPassword(req: Request, res: Response) {
    const { token } = req.params;
    const { newPassword } = req.body;

    checkDataExistence(res, [req.body, newPassword], "Please fill in new password field.", true);
    validateData(passwordValidation, { password: newPassword }, res );

    // verify token
    const verifiedToken = jwt.verify(token, `${process.env.JWT_SECRET}`) as JwtPayload;

    if(!verifiedToken) {
        res.status(401);
        throw new Error('Token is not verified.');
    };

    const tokenFromDB = await Token.findOne({ token, expiresAt: { $gt: Date.now() } });

    if(!tokenFromDB) {
        res.status(404);
        throw new Error("Invalid or expired token");
    };

    const user = await User.findById(tokenFromDB.userId);

    if(user === null) {
        res.status(404);
        throw new Error("User not found.");
    };

    user.password = newPassword;
    await user.save();

    res.status(200).json({
        success: true,
        message: "Password has been changed succesfully. Please login.",
    });
};

export default resetPassword;