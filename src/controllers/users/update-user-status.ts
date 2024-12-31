import { Request, Response } from "express";

import UserModel from "../../models/user";
import { sendPushNotification } from "../../expo-push-notification/notification";
import GeneralMessage from "../../email/general/message";
import mongoose from "mongoose";

export const handleUserStatusUpdate = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { status } = req.body;
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      res
        .status(400)
        .json({ success: false, message: "Valid User ID required" });
      return;
    }

    if (status === undefined || status === null) {
      res.status(400).json({
        success: false,
        message: "Status Not Provided",
      });
      return;
    }

    if (status !== 1 && status !== -1) {
      res.status(400).json({
        success: false,
        message: "Status Not Allowed",
      });
      return;
    }

    const foundUser = await UserModel.findById(userId).exec();

    if (!foundUser) {
      res.status(404).json({ success: false, message: "User Not Found" });
      return;
    }

    if (foundUser.status === status) {
      res
        .status(400)
        .json({ success: false, message: "No Status Change Detected" });
      return;
    }

    if (status === 1 || status === -1) {
      foundUser.status = status;
      await foundUser.save();

      if (status === -1) {
        foundUser.loginToken = undefined;
        await foundUser.save();
      }

      if (status === 1) {
        if (foundUser.pushToken) {
          await sendPushNotification({
            body: `Hello ${foundUser.firstName}, Your account has been reactivated sucessfully`,
            pushTokens: [foundUser.pushToken],
            title: "Reactivation Successful",
            subTitle: "User",
          });
        }
        GeneralMessage({
          email: foundUser.email,
          title: "Reactivation Successful",
          userName: foundUser.userName,
          body: "Account has been successfully reactivated. You can login to owomonie mobile app.",
        });
      }
    }

    res
      .status(200)
      .json({
        success: true,
        message: `User ${foundUser.userName} Status Updated Successfully`,
      });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
