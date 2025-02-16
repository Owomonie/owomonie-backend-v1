import { syncTransactions } from "../../controllers/plaid-banks/sync-transactions";

export function handleTxnWebhook({
  code,
  requestBody,
}: {
  code: string;
  requestBody: any;
}) {
  switch (code) {
    case "SYNC_UPDATES_AVAILABLE":
      syncTransactions({ itemName: requestBody.item_id });
      break;

    default:
      console.log(`Can't handle webhook code ${code}`);
      break;
  }
}
