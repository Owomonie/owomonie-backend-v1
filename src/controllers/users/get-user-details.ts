import { Request, Response } from "express";

import UserModel from "../../models/user";

export const handleGetUserDetails = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    //@ts-ignore
    const userId = req.user.userId;

    const user = await UserModel.findById(userId).exec();

    if (!user) {
      res.status(404).json({ success: false, message: "User Not Found" });
      return;
    }

    const {
      password,
      resettingPassword,
      isAdmin,
      otp,
      otpExpiry,
      __v,
      ...userResponse
    } = user.toObject();

    res.status(200).json({ success: true, user: userResponse });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
