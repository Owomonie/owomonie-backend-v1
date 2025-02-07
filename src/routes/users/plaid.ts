import { Router } from "express";
import { handleGeneratePlaidLinkToken } from "../../controllers/plaid-banks/generate-link-token";
import { handleExchangePlaidPublicToken } from "../../controllers/plaid-banks/exchange-public-token";

const plaid = Router();

plaid.get("/get-public-token", handleGeneratePlaidLinkToken);
plaid.post("/exchange-public-token", handleExchangePlaidPublicToken);

export default plaid;
