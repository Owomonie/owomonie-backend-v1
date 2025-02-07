import { Request, Response } from "express";

import UserModel from "../../models/user";
import {
  PLAID_COUNTRY_CODES,
  PLAID_PRODUCTS,
  PLAID_WEBHOOK_URL,
  plaidClient,
} from "../../config/plaid";

export const handleGeneratePlaidLinkToken = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    //@ts-ignore
    const userId = req.user.userId;

    const user = await UserModel.findById(userId).exec();

    if (!user) {
      res.status(404).json({ success: false, message: "User Not Found" });
      return;
    }

    const userObject = { client_user_id: userId };
    const tokenResponse = await plaidClient.linkTokenCreate({
      user: userObject,
      client_name: "Owomonie",
      language: "en",
      products: PLAID_PRODUCTS,
      country_codes: PLAID_COUNTRY_CODES,
      webhook: PLAID_WEBHOOK_URL,
    });

    res.json(tokenResponse.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
