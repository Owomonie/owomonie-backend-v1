import { Router } from "express";
import { handleGeneratePlaidLinkToken } from "../../controllers/plaid-banks/generate-link-token";
import { handleExchangePlaidPublicToken } from "../../controllers/plaid-banks/exchange-public-token";
import {
  handleGetUserAccounts,
  handleGetUserBanks,
} from "../../controllers/plaid-banks/get-user-bank-info";

const plaid = Router();

plaid.get("/get-link-token", handleGeneratePlaidLinkToken);
plaid.get("/get-user-banks", handleGetUserBanks);
plaid.get("/get-user-accounts", handleGetUserAccounts);
plaid.post("/exchange-public-token", handleExchangePlaidPublicToken);

export default plaid;
