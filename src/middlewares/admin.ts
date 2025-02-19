import { Request, Response, NextFunction } from "express";
import UserModel from "../models/user";

const authenticateAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    //@ts-ignore
    const userId = req.user.userId;

    if (!userId) {
      res.status(400).json({ success: false, message: "User ID not found" });
      return;
    }

    const user = await UserModel.findById(userId);

    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    if (!user?.isAdmin) {
      res
        .status(403)
        .json({ success: false, message: "Access Denied: Admins Only" });
      return;
    }

    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
    return;
  }
};

export default authenticateAdmin;
