import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import UserModel from "../../models/user";
import { sendPushNotification } from "../../expo-push-notification/notification";

const JWT_SECRET = process.env.JWT_SECRET!;

const ADMIN_ROUTE_ONE = process.env.ADMIN_ROUTE_ONE!;
const ADMIN_ROUTE_TWO = process.env.ADMIN_ROUTE_TWO!;

const JWT_EXPIRATION = "3h";

export const handleLogin = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { email, password, pushToken } = req.body;

  const origin = req.headers.origin;

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

    if (origin === ADMIN_ROUTE_ONE && !foundUser.isAdmin) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    if (pushToken) {
      foundUser.pushToken = pushToken;
    }
    await foundUser.save();

    if (foundUser.status === -1) {
      if (foundUser.pushToken) {
        await sendPushNotification({
          body: `Hello ${foundUser.firstName}, Your account has been suspended. Kindly reach out to customer care service`,
          pushTokens: [foundUser.pushToken],
          title: "Login Failed",
        });
        res.status(401).json({ success: false, message: "Account Suspended" });
      }
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
    await foundUser.save();

    const formattedLastLogin = foundUser.lastLogin.toLocaleString();

    // Create a token payload
    const payload = {
      userId: foundUser._id,
      email: foundUser.email,
      isAdmin: foundUser.isAdmin,
    };

    // Generate a JWT token
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRATION });

    foundUser.loginToken = token;
    await foundUser.save();

    // If the user has a push token, send the push notification
    if (foundUser.pushToken) {
      await sendPushNotification({
        body: `Hello ${foundUser.firstName}, Your account was logged in at ${formattedLastLogin}`,
        pushTokens: [foundUser.pushToken],
        title: "Login Successful",
      });
    }

    res.status(200).json({
      success: true,
      message: "Login Sucesssful",
      data: foundUser.loginToken,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
