import { Request, Response } from "express";

import UserModel from "../../models/user";
import { plaidClient } from "../../config/plaid";

export const handleExchangePlaidPublicToken = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    //@ts-ignore
    const userId = req.user.userId;
    const publicToken = req.body.publicToken;

    if (!publicToken) {
      res
        .status(400)
        .json({ success: false, message: "Public token is required" });
      return;
    }

    const user = await UserModel.findById(userId).exec();

    if (!user) {
      res.status(404).json({ success: false, message: "User Not Found" });
      return;
    }

    const tokenResponse = await plaidClient.itemPublicTokenExchange({
      public_token: publicToken,
    });

    console.log(tokenResponse.data);
    res.json(tokenResponse.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
