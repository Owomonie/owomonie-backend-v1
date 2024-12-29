import { Request, Response } from "express";
import { expo, isExpoPushToken } from "../../config/expo-push-notification";

export const handleSendMessage = async (
  req: Request,
  res: Response
): Promise<void> => {
  const somePushTokens = ["ExponentPushToken[OCKa1dKZdj-trEK1XFODPw]"];

  if (!somePushTokens || somePushTokens.length === 0) {
    res.status(400).send("No push tokens provided.");
    return;
  }

  let messages = [];

  // Validate push tokens
  for (let pushToken of somePushTokens) {
    if (!isExpoPushToken(pushToken)) {
      console.error(`Push token ${pushToken} is not valid`);
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
    // Send push notifications
    for (let chunk of chunks) {
      let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      console.log("Notification Ticket Chunk:", ticketChunk);
      tickets.push(...ticketChunk);
    }
  } catch (error) {
    console.error("Error sending push notifications:", error);
    res.status(500).send("Error sending push notifications.");
    return;
  }

  let receiptIds = tickets
    .filter((ticket) => ticket.status === "ok")
    .map((ticket) => ticket.id);

  let receiptIdChunks = expo.chunkPushNotificationReceiptIds(receiptIds);

  try {
    // Retrieve receipts
    for (let chunk of receiptIdChunks) {
      let receipts = await expo.getPushNotificationReceiptsAsync(chunk);
      console.log("Receipts:", receipts);

      for (let receiptId in receipts) {
        //@ts-ignore
        let { status, message, details } = receipts[receiptId];
        if (status === "ok") continue;

        console.error(`Error sending notification: ${message}`);
        //@ts-ignore
        if (details && details.error) {
          //@ts-ignore
          console.error(`Error code: ${details.error}`);
        }
      }
    }
  } catch (error) {
    console.error("Error retrieving receipts:", error);
    res.status(500).send("Error retrieving receipts.");
    return;
  }

  res.status(200).send({
    message: "Notifications sent successfully.",
    tickets: tickets,
  });
};
