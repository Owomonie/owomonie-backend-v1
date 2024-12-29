import { Expo } from "expo-server-sdk";

let expo = new Expo({
  accessToken: process.env.EXPO_ACCESS_TOKEN,
  useFcmV1: true,
});

export const sendPushNotification = async (
  pushTokens: string[],
  body: string,
  data: any
): Promise<any> => {
  if (!pushTokens || pushTokens.length === 0) {
    throw new Error("No push tokens provided.");
  }

  if (!body) {
    throw new Error("Message Body is required");
  }

  let messages = [];

  for (let pushToken of pushTokens) {
    if (!Expo.isExpoPushToken(pushToken)) {
      console.error(`Push token ${pushToken} is not a valid Expo push token`);
      continue;
    }

    messages.push({
      to: pushToken,
      sound: "default",
      body,
      data: {
        data,
      },
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
    throw new Error("Error sending push notifications.");
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
        const { status, details } = receipts[receiptId];
        if (status === "ok") continue;
        if (details && details.error) {
          console.error(`Error code: ${details.error}`);
        }
      }
    }
  } catch (error) {
    console.error("Error retrieving receipts:", error);
    throw new Error("Error retrieving receipts.");
  }

  return {
    message: "Notifications sent successfully.",
    tickets: tickets,
  };
};
