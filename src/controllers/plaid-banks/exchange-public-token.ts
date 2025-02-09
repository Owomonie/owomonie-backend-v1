import { Request, Response } from "express";
import escape from "escape-html";

import UserModel from "../../models/user";
import { plaidClient } from "../../config/plaid";
import { sendPushNotification } from "../../expo-push-notification/notification";
import GeneralMessage from "../../email/general/message";
import removeBankSuffix from "./../../utils/bankSuffixRemove";

export const handleExchangePlaidPublicToken = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    //@ts-ignore
    const userId = req.user.userId;
    const { publicToken, numberOfAccounts, bankName } = req.body;

    const bankNameWithoutBankSuffix = removeBankSuffix(bankName);

    const public_token = escape(publicToken);

    if (!publicToken) {
      res
        .status(400)
        .json({ success: false, message: "Public token is required" });
      return;
    }

    const foundUser = await UserModel.findById(userId).exec();

    if (!foundUser) {
      res.status(404).json({ success: false, message: "User Not Found" });
      return;
    }

    const tokenResponse = await plaidClient.itemPublicTokenExchange({
      public_token,
    });

    console.log(tokenResponse.data);
    const accountSuffix = numberOfAccounts === 1 ? "account" : "accounts";

    const body = `Hi ${foundUser.firstName}, ${numberOfAccounts} ${accountSuffix} have been successfully linked from ${bankNameWithoutBankSuffix} Bank`;
    const title = "Bank Account Linked Successfully";

    if (foundUser.pushToken) {
      await sendPushNotification({
        body,
        pushTokens: [foundUser.pushToken],
        title,
      });
    }

    GeneralMessage({
      email: foundUser.email,
      title,
      body,
    });

    res.json({
      message: `Account Linked Successfully`,
      success: true,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
