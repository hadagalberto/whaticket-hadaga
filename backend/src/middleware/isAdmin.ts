import { Request, Response, NextFunction } from "express";
import AppError from "../errors/AppError";

const isAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    throw new AppError("ERR_SESSION_EXPIRED", 401);
  }

  if (req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  return next();
};

export default isAdmin;
