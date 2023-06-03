import { Request, Response, NextFunction } from "express";

export function catchAsync(fn: any, args: any[] = []) {
    return (req: Request, res: Response, next: NextFunction) => {
      fn(req, res, next, ...args).catch((err: any) => next(err));
    };
}
  