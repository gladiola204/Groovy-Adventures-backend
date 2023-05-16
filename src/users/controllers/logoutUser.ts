import { Request, Response } from 'express';
import Token from '../../models/tokenModel';

async function logoutUser(req: Request, res: Response) {
    const { token } = req.body;

    await Token.deleteOne({ token });

    res.status(200).json({
        success: true,
        message: "User logged out."
    })
};

export default logoutUser;