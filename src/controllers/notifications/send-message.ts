import { Request, Response } from "express";
import { expo, isExpoPushToken } from "../../config/expo-push-notification";

export const handleSendMesaage = async (
  req: Request,
  res: Response
): Promise<void> => {
  let messages = [];

  for (let pushToken of somePushTokens) {
    if (!isExpoPushToken(pushToken)) {
      console.error(`Push token ${pushToken} is not a valid Expo push token`);
      continue;
    }

    messages.push({
      to: pushToken,
      sound: "default",
      body: "This is a test notification",
      data: { withSome: "data" },
    });
  }

  let chunks = expo.chunkPushNotifications(messages);

  let tickets: any[] = [];
  try {
    for (let chunk of chunks) {
      let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      console.log("Notification Ticket Chunk:", ticketChunk);
      tickets.push(...ticketChunk);
    }
  } catch (error) {
    console.error("Error sending push notifications:", error);
  }

  let receiptIds = tickets
    .filter((ticket) => ticket.status === "ok")
    .map((ticket) => ticket.id);

  let receiptIdChunks = expo.chunkPushNotificationReceiptIds(receiptIds);

  try {
    for (let chunk of receiptIdChunks) {
      let receipts = await expo.getPushNotificationReceiptsAsync(chunk);
      console.log("Receipts:", receipts);

      for (let receiptId in receipts) {
        //@ts-ignore
        let { status, message, details } = receipts[receiptId];
        if (status === "ok") {
          continue;
        } else if (status === "error") {
          console.error(`Error sending notification: ${message}`);
          //@ts-ignore
          if (details && details.error) {
            //@ts-ignore
            console.error(`Error code: ${details.error}`);
          }
        }
      }
    }
  } catch (error) {
    console.error("Error retrieving receipts:", error);
  }
};

const somePushTokens = ["ExponentPushToken[OCKa1dKZdj-trEK1XFODPw]"];
