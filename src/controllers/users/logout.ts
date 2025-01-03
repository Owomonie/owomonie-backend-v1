import { Request, Response } from "express";

import UserModel from "../../models/user";

export const handleLogout = async (
  req: Request,
  res: Response
): Promise<void> => {
  //@ts-ignore
  const userId = req.user.userId;

  try {
    const foundUser = await UserModel.findById(userId).exec();

    if (!foundUser) {
      res.status(404).json({ success: false, message: "User Not Found" });
      return;
    }

    foundUser.pushToken = undefined;
    foundUser.loginToken = undefined;

    await foundUser.save();

    res.status(200).json({
      success: true,
      message: "You are successfully Logged out",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
