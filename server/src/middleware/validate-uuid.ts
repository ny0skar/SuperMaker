import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import type { ApiResponse } from "@supermaker/shared";

const uuidSchema = z.string().uuid();

export function validateUuidParam(...paramNames: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    for (const name of paramNames) {
      if (!uuidSchema.safeParse(req.params[name]).success) {
        res
          .status(400)
          .json({ success: false, error: `Invalid ${name} format` } satisfies ApiResponse);
        return;
      }
    }
    next();
  };
}
