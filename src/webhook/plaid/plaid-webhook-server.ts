import express, { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import { handleItemWebhook } from "./item";
import { handleTxnWebhook } from "./transaction";
import { errorHandler } from "./errorHandler";

dotenv.config();

const plaidWebhookPort = process.env.PLAID_WEBHOOK_PORT!;

const plaidWebhookApp = express();

plaidWebhookApp.use(express.json());

plaidWebhookApp.post(
  "/server/receive_webhook",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log("**INCOMING WEBHOOK FROM PLAID**");
      console.dir(req.body, { colors: true, depth: null });
      const product = req.body.webhook_type;
      const code = req.body.webhook_code;

      switch (product) {
        case "ITEM":
          handleItemWebhook({ code, requestBody: req.body });
          break;
        case "TRANSACTIONS":
          handleTxnWebhook({ code, requestBody: req.body });
          break;
        default:
          console.log(`Can't handle webhook product ${product}`);
          break;
      }
      res.json({ status: "New Update Received", success: true });
    } catch (error) {
      next(error);
    }
  }
);

plaidWebhookApp.use(errorHandler);

const plaidWebhookServer = plaidWebhookApp.listen(plaidWebhookPort, () =>
  console.log(`Plaid Webhook Server running on port ${plaidWebhookPort}`)
);

export const getPlaidWebhookServer = function () {
  return plaidWebhookServer;
};
