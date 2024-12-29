import { Expo } from "expo-server-sdk";

export const expo = new Expo({
  accessToken: process.env.EXPO_ACCESS_TOKEN,
});

export const isExpoPushToken = (pushToken: string): boolean => {
  return Expo.isExpoPushToken(pushToken);
};
