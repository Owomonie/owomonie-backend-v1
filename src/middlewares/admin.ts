import { Request, Response, NextFunction } from "express";

const authenticateAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  //@ts-ignore
  if (req.user && req.user.isAdmin) {
    return next();
  }

  res
    .status(403)
    .json({ success: false, message: "Access Denied: Admins Only" });
};

export default authenticateAdmin;
