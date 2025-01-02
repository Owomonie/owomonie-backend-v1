import { Request, Response } from "express";
import NotificationModel from "../../models/notification";

export const handleGetAllDraftNotification = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    // Fetch notifications with status = 0
    const draftNotifications = await NotificationModel.find({ status: 0 });

    res.status(200).json({ success: true, draftNotifications });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const handleGetAllSentNotification = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    // Fetch notifications with status = 1
    const sentNotifications = await NotificationModel.find({ status: 1 });

    res.status(200).json({ success: true, sentNotifications });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
