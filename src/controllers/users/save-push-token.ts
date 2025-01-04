import { Request, Response } from "express";

import PushTokenModel from "../../models/pushTokens";

export const handleSavePushToken = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { pushToken } = req.body;

  const expoPushTokenRegex = /^ExponentPushToken\[(.*?)\]$/;

  try {
    const foundPushToken = await PushTokenModel.findOne({ pushToken }).exec();

    if (!pushToken || !expoPushTokenRegex.test(pushToken)) {
      res
        .status(400)
        .json({ success: false, message: "Invalid Mobile Device" });
      return;
    }

    if (foundPushToken) {
      res.status(409).json({ success: false, message: "Push Token Exist" });
      return;
    }

    await PushTokenModel.create({ pushToken });

    res
      .status(200)
      .json({ success: true, message: "Unauthenticated Push Token Saved" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
