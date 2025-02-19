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

    const userData = {
      id: user._id,
      email: user.email,
      status: user.status,
      firstName: user.firstName,
      lastName: user.lastName,
      userName: user.userName,
      ageRange: user.ageRange,
      avatar: user.avatar,
      gender: user.gender,
      incomeRange: user.incomeRange,
      workType: user.workType,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
    };

    res.status(200).json({ success: true, data: userData });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
