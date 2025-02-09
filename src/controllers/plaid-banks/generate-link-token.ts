import { Request, Response } from "express";

import UserModel from "../../models/user";
import {
  PLAID_COUNTRY_CODES,
  PLAID_PRODUCTS,
  PLAID_WEBHOOK_URL,
  plaidClient,
} from "../../config/plaid";

const ANDROID_PACKAGE_NAME = process.env.ANDROID_PACKAGE_NAME!;

export const handleGeneratePlaidLinkToken = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    //@ts-ignore
    const userId = req.user.userId;

    const foundUser = await UserModel.findById(userId).exec();

    if (!foundUser) {
      res.status(404).json({ success: false, message: "User Not Found" });
      return;
    }

    const userObject = {
      client_user_id: userId,
      email_address: foundUser.email,
    };

    const tokenResponse = await plaidClient.linkTokenCreate({
      user: userObject,
      client_name: "Owomonie",
      language: "en",
      products: PLAID_PRODUCTS,
      country_codes: PLAID_COUNTRY_CODES,
      webhook: PLAID_WEBHOOK_URL,
      android_package_name: ANDROID_PACKAGE_NAME,
    });

    res.json({ data: tokenResponse.data, success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
