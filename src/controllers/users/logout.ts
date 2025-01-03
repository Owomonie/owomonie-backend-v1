import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import UserModel from "../../models/user";
import { sendPushNotification } from "../../expo-push-notification/notification";

const JWT_SECRET = process.env.JWT_SECRET!;

const ADMIN_ROUTE_ONE = process.env.ADMIN_ROUTE_ONE!;
const ADMIN_ROUTE_TWO = process.env.ADMIN_ROUTE_TWO!;

const JWT_EXPIRATION = "3h";

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
      message: "Logout Sucesssful",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
