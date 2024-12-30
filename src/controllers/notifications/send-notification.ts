import { Request, Response } from "express";
import mongoose from "mongoose";
import PushTokenModel from "../../models/pushTokens";
import { sendPushNotification } from "../../expo-push-notification/notification";
import UserModel from "../../models/user";
import GeneralMessage from "../../email/general/message";
import NotificationModel from "../../models/notification";

export const handleSendNotification = async (
  req: Request,
  res: Response
): Promise<void> => {
  /**
   * type
   * 0 -> PushNotification
   * 1 -> Email
   * 2 -> PushNotification and Email
   *
   * Status
   * 0 -> Draft
   * 1 -> Send
   */
  const { title, body, type, status, categories, recipient } = req.body;

  // Check for missing required fields
  if (!title) {
    res.status(400).json({ success: false, message: "Subject Not Found" });
    return;
  }
  if (!body) {
    res.status(400).json({ success: false, message: "Message Not Found" });
    return;
  }
  if (!recipient) {
    res.status(400).json({ success: false, message: "Recipient(s) Not Found" });
    return;
  }
  if (!type) {
    res
      .status(400)
      .json({ success: false, message: "Notification Type Not Selected" });
    return;
  }
  if (!status) {
    res.status(400).json({ success: false, message: "No actions selected" });
    return;
  }

  // Validate `type` (should be one of 0, 1, or 2)
  if (![0, 1, 2].includes(type)) {
    res.status(400).json({
      success: false,
      message: "Invalid notification type. Valid types are 0, 1, or 2.",
    });
    return;
  }

  // Validate `status` (should be 0 or 1)
  if (![0, 1].includes(status)) {
    res.status(400).json({
      success: false,
      message: "Invalid status. Valid statuses are 0 (Draft) or 1 (Send).",
    });
    return;
  }

  try {
    if (status === 1) {
      if (type === 0 || type === 2) {
        if (recipient === "all") {
          // Fetch all push tokens
          const pushTokens = await PushTokenModel.find();
          const pushTokenStrings = pushTokens.map((token) => token.pushToken);

          // Filter out undefined values
          const validPushTokenStrings = pushTokenStrings.filter(
            (token) => token !== undefined
          );

          if (validPushTokenStrings.length > 0) {
            await sendPushNotification({
              pushTokens: validPushTokenStrings, // Pass only valid push tokens
              title,
              body,
              subTitle: "All", // Optional: add subtitle if needed
            });
          }
        } else if (recipient === "users") {
          // Fetch users and their push tokens
          const users = await UserModel.find();
          const pushTokens = users.map((user) => user.pushToken);

          // Filter out undefined values
          const validPushTokens = pushTokens.filter(
            (token) => token !== undefined
          );

          if (validPushTokens.length > 0) {
            await sendPushNotification({
              pushTokens: validPushTokens, // Pass only valid push tokens
              title,
              body,
              subTitle: "Users", // Optional: add subtitle if needed
            });
          }
        } else {
          // If the recipient is a specific user ID, validate and fetch their push token
          if (!mongoose.Types.ObjectId.isValid(recipient)) {
            res
              .status(400)
              .json({ success: false, message: "Valid Recipient ID required" });
            return;
          }

          const foundRecipient = await UserModel.findOne({
            _id: recipient,
          }).exec();

          if (!foundRecipient) {
            res.status(401).json({ message: "Recipient Not Found" });
            return;
          }

          if (foundRecipient.pushToken) {
            await sendPushNotification({
              pushTokens: [foundRecipient.pushToken],
              title,
              body,
              subTitle: `$Hi ${foundRecipient.userName}`,
            });
          } else {
            res.status(400).json({ message: "Recipient has no push token" });
            return;
          }
        }
      }

      if (type === 1 || type === 2) {
        if (recipient === "users") {
          // Fetch users and their emails
          const users = await UserModel.find();

          // Loop through each user and send them an individual email
          for (const user of users) {
            const { userName, email } = user;

            // Send the email to each user
            GeneralMessage({
              email,
              title,
              body,
              userName,
            });
          }
        } else {
          // If the recipient is a specific user ID, validate and fetch their push token
          if (!mongoose.Types.ObjectId.isValid(recipient)) {
            res
              .status(400)
              .json({ success: false, message: "Valid Recipient ID required" });
            return;
          }

          const foundRecipient = await UserModel.findOne({
            _id: recipient,
          }).exec();

          if (!foundRecipient) {
            res
              .status(401)
              .json({ message: "Recipient Not Found", success: false });
            return;
          }

          GeneralMessage({
            email: foundRecipient.email,
            title,
            body,
            userName: foundRecipient.userName,
          });
        }
      }
    }

    const notification = await NotificationModel.create({
      title,
      body,
      type,
      status,
      categories,
      recipient,
      createdAt: new Date(),
    });

    await notification.save();

    res.status(200).json({
      success: true,
      message: "Notification sent successfully",
      notification,
    });
  } catch (error) {
    console.error("Error sending notification:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
