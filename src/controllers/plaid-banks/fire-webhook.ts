import { Request, Response, NextFunction } from "express";
import { Types } from "mongoose";

import {
  SandboxItemFireWebhookRequestWebhookCodeEnum,
  WebhookType,
} from "plaid";
import ItemModel from "../../models/plaid/item";
import { plaidClient, PLAID_WEBHOOK_URL } from "../../config/plaid";

export const handleFireTestWebhookSyncTxn = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { bankId } = req.body;

    if (!bankId) {
      res.status(400).json({ success: false, message: "Bank Id Required" });
      return;
    }

    if (!Types.ObjectId.isValid(bankId)) {
      res.status(400).json({ success: false, message: "Invalid Bank Id" });
      return;
    }

    const item = await ItemModel.findOne({ _id: bankId });

    if (!item) {
      res.status(400).json({ success: false, message: "Bank Not Found" });
      return;
    }

    await plaidClient.itemWebhookUpdate({
      access_token: item.accessToken,
      webhook: PLAID_WEBHOOK_URL,
    });

    const fireWebhookResponse = await plaidClient.sandboxItemFireWebhook({
      access_token: item.accessToken,
      webhook_type: WebhookType.Transactions,
      webhook_code:
        SandboxItemFireWebhookRequestWebhookCodeEnum.SyncUpdatesAvailable,
    });
    res.json({ data: fireWebhookResponse.data, success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
