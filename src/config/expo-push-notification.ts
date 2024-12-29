import { Expo } from "expo-server-sdk";

export const expo = new Expo({
  accessToken: process.env.EXPO_ACCESS_TOKEN,
  useFcmV1: true,
});

export const isExpoPushToken = (pushToken: string): boolean => {
  return Expo.isExpoPushToken(pushToken);
};
