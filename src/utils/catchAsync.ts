import type { RequestHandler, Request, Response, NextFunction } from "express";

export const catchAsync =
  (fn: RequestHandler) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
