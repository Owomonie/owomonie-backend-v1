import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import UserModel from "../../models/user";
import { sendPushNotification } from "../../expo-push-notification/notification";

const JWT_SECRET = process.env.JWT_SECRET!;

const JWT_EXPIRATION = "1h";

export const handleLogin = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { email, password } = req.body;

  if (!email || !password) {
    res
      .status(400)
      .json({ success: false, message: "Missing Login Credentials" });
    return;
  }

  try {
    const foundUser = await UserModel.findOne({ email }).exec();

    if (!foundUser) {
      res.status(401).json({ success: false, message: "Unregistered Email" });
      return;
    }

    const isMatch =
      foundUser.password &&
      (await bcrypt.compare(password, foundUser.password));

    if (!isMatch) {
      res.status(400).json({ success: false, message: "Invalid Password" });
      return;
    }

    foundUser.lastLogin = new Date();

    // Create a token payload
    const payload = {
      userId: foundUser._id,
      email: foundUser.email,
      isAdmin: foundUser.isAdmin,
    };

    // Generate a JWT token
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRATION });

    const pushData = {
      lastLogin: foundUser.lastLogin,
    };

    // If the user has a push token, send the push notification
    if (foundUser.pushToken) {
      await sendPushNotification(
        [foundUser.pushToken],
        "Login successful!",
        pushData
      );
    }

    res.status(200).json({
      success: true,
      message: "Login Sucesssful",
      token,
      isAdmin: foundUser.isAdmin,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
