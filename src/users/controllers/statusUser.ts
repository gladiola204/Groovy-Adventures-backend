import { Request, Response } from 'express';

async function statusUser(req: Request, res: Response) {
    res.status(200).json({
        success: true,
    });
};

export default statusUser;