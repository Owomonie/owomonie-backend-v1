import {
  Configuration,
  PlaidEnvironments,
  PlaidApi,
  Products,
  CountryCode,
} from "plaid";

const PLAID_ENV = process.env.PLAID_ENV!?.toLowerCase();

const COUNTRY_CODES = process.env.PLAID_COUNTRY_CODES!?.split(",");

const PRODUCTS = process.env.PLAID_PRODUCTS!?.split(",");

export const PLAID_PRODUCTS: Products[] = PRODUCTS as Products[];

export const PLAID_COUNTRY_CODES: CountryCode[] =
  COUNTRY_CODES as CountryCode[];

export const PLAID_WEBHOOK_URL = process.env.PLAID_WEBHOOK_URL!;

const plaidConfig = new Configuration({
  basePath: PlaidEnvironments[PLAID_ENV],
  baseOptions: {
    headers: {
      "PLAID-CLIENT-ID": process.env.PLAID_CLIENT_ID!,
      "PLAID-SECRET": process.env.PLAID_SECRET!,
      "Plaid-Version": "2020-09-14",
    },
  },
});

const plaidClient = new PlaidApi(plaidConfig);

export { plaidClient };
