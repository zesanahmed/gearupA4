import { z } from "zod";
import type { Request, Response, NextFunction } from "express";

export const validate =
  <T extends z.ZodType>(schema: T) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      req.validated = parsed;
      next();
    } catch (err) {
      next(err);
    }
  };
