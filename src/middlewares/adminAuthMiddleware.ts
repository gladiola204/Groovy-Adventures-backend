import { Request, Response, NextFunction } from "express";

const adminProtection = (req: Request, res: Response, next: NextFunction) => {
    // Sprawdź, czy użytkownik jest uwierzytelniony
    if (!req.user) {
        res.status(401);
        throw new Error('User not authenticated');
    }
    
    if (req.user.role === 'user') {
        res.status(403);
        throw new Error('Access denied');
    }
    
    req.admin = req.user;
    req.user = undefined;

    next();
};

export default adminProtection;