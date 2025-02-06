import { Router } from "express";
import { handleGeneratePlaidPublicToken } from "../../controllers/plaid-banks/generate-public-token";

const plaid = Router();

plaid.get("/public-token", handleGeneratePlaidPublicToken);

export default plaid;
