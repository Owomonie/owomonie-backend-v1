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
  const { title, body, type, status, categories, recipient } = req.body;

  //@ts-ignore
  const userId = req.user.userId;

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
  if (!["0", "1", "2"].includes(type)) {
    res.status(400).json({
      success: false,
      message: "Invalid notification type. Valid types are 0, 1, or 2.",
    });
    return;
  }

  // Validate `status` (should be 0 or 1)
  if (!["0", "1"].includes(status)) {
    res.status(400).json({
      success: false,
      message: "Invalid status. Valid statuses are 0 (Draft) or 1 (Send).",
    });
    return;
  }

  try {
    const pushTokens = await PushTokenModel.find();
    const users = await UserModel.find();

    if (status === "1") {
      if (type === "0" || type === "2") {
        if (recipient === "all") {
          // Fetch all push tokens
          const pushTokenStrings = pushTokens.map((token) => token.pushToken);

          // Filter out undefined values
          const validPushTokenStrings = pushTokenStrings.filter(
            (token) => token !== undefined
          );

          if (validPushTokenStrings.length > 0) {
            await sendPushNotification({
              pushTokens: validPushTokenStrings,
              title,
              body,
              subTitle: "All", // Optional: add subtitle if needed
            });
          }
        } else if (recipient === "users") {
          // Fetch users and their push tokens
          const pushTokens = users.map((user) => user.pushToken);

          // Filter out undefined values
          const validPushTokens = pushTokens.filter(
            (token) => token !== undefined
          );

          if (validPushTokens.length > 0) {
            await sendPushNotification({
              pushTokens: validPushTokens,
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
              subTitle: `Hi ${foundRecipient.userName}`,
            });
          } else {
            res.status(400).json({ message: "Recipient has no push token" });
            return;
          }
        }
      }

      if (type === "1" || type === "2") {
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
          // If the recipient is a specific user ID, validate and fetch their email
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
            res.status(401).json({
              message: "Recipient Not Found",
              success: false,
            });
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

    // If the recipient is "all" or "users", set recipient to null or another default value
    const notification = await NotificationModel.create({
      title,
      body,
      type,
      status,
      categories,
      recipient,
      createdAt: new Date(),
      sender: userId,
      totalReceivers:
        recipient === "all"
          ? pushTokens.length
          : recipient === "users"
          ? users.length
          : 1,
    });

    await notification.save();

    res.status(200).json({
      success: true,
      message:
        status === "1"
          ? "Notification sent successfully"
          : "Notification Saved as Draft",
    });
  } catch (error) {
    console.error("Error sending notification:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const handleDraftToSendNotification = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { notificationId } = req.params;

  if (!notificationId) {
    res
      .status(400)
      .json({ success: false, message: "Notification ID is required" });
    return;
  }

  try {
    const notification = await NotificationModel.findById(
      notificationId
    ).exec();

    if (!notification) {
      res
        .status(404)
        .json({ success: false, message: "Notification Not Found" });
      return;
    }

    notification.status = 1;
    notification.createdAt = new Date();
    await notification.save();

    const pushTokens = await PushTokenModel.find();
    const users = await UserModel.find();

    const { type, recipient, title, body } = notification;

    if (type.toString() === "0" || type.toString() === "2") {
      if (recipient === "all") {
        // Fetch all push tokens
        const pushTokenStrings = pushTokens.map((token) => token.pushToken);

        // Filter out undefined values
        const validPushTokenStrings = pushTokenStrings.filter(
          (token) => token !== undefined
        );

        if (validPushTokenStrings.length > 0) {
          await sendPushNotification({
            pushTokens: validPushTokenStrings,
            title,
            body,
            subTitle: "All", // Optional: add subtitle if needed
          });
        }
      } else if (recipient === "users") {
        // Fetch users and their push tokens
        const pushTokens = users.map((user) => user.pushToken);

        // Filter out undefined values
        const validPushTokens = pushTokens.filter(
          (token) => token !== undefined
        );

        if (validPushTokens.length > 0) {
          await sendPushNotification({
            pushTokens: validPushTokens,
            title,
            body,
            subTitle: "Users", // Optional: add subtitle if needed
          });
        }
      } else {
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
            subTitle: `Hi ${foundRecipient.userName}`,
          });
        } else {
          res.status(400).json({ message: "Recipient has no push token" });
          return;
        }
      }
    }

    if (type.toString() === "1" || type.toString() === "2") {
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
        const foundRecipient = await UserModel.findOne({
          _id: recipient,
        }).exec();

        if (!foundRecipient) {
          res.status(401).json({
            message: "Recipient Not Found",
            success: false,
          });
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

    res.status(200).json({
      success: true,
      message: "Notification sent successfully",
    });
  } catch (error) {
    console.error("Error Sending notification (Draft):", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
