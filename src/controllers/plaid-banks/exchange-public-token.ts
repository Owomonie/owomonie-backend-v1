import { Request, Response } from "express";
import escape from "escape-html";
import UserModel from "../../models/user";
import ItemModel from "../../models/plaid/item";
import PLaidBankLogoModel from "../../models/plaid/logo";
import { PLAID_COUNTRY_CODES, plaidClient } from "../../config/plaid";
import { sendPushNotification } from "../../expo-push-notification/notification";
import GeneralMessage from "../../email/general/message";
import removeBankSuffix from "./../../utils/bankSuffixRemove";
import AccountModel from "../../models/plaid/account";

export const handleExchangePlaidPublicToken = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    //@ts-ignore
    const userId = req.user.userId;
    const { publicToken, numberOfAccounts, bankName } = req.body;

    const bankNameWithoutBankSuffix = removeBankSuffix(bankName);

    const public_token = escape(publicToken);

    if (!publicToken) {
      res
        .status(400)
        .json({ success: false, message: "Public token is required" });
      return;
    }

    const foundUser = await UserModel.findById(userId).exec();

    if (!foundUser) {
      res.status(404).json({ success: false, message: "User Not Found" });
      return;
    }

    const tokenResponse = await plaidClient.itemPublicTokenExchange({
      public_token,
    });

    const accessToken = tokenResponse.data.access_token;

    await populateItemDatabase({
      accessToken,
      itemId: tokenResponse.data.item_id,
      userId,
      name: bankName,
    });

    await populateAccountDatabase({
      accessToken,
      userId,
    });

    const accountSuffix = numberOfAccounts === 1 ? "account" : "accounts";

    const body = `Hi ${foundUser.firstName}, ${numberOfAccounts} ${accountSuffix} have been successfully linked to Owomonie from ${bankNameWithoutBankSuffix} Bank`;
    const title = "Bank Account Linked Successfully";

    if (foundUser.pushToken) {
      await sendPushNotification({
        body,
        pushTokens: [foundUser.pushToken],
        title,
      });
    }

    GeneralMessage({
      email: foundUser.email,
      title,
      body,
    });

    res.json({
      message: `Account Linked Successfully`,
      success: true,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Function to populate Item database
const populateItemDatabase = async ({
  itemId,
  accessToken,
  userId,
  name,
}: {
  itemId: string;
  accessToken: string;
  userId: string;
  name: string;
}) => {
  try {
    const foundUser = await UserModel.findById(userId).exec();

    const itemResponse = await plaidClient.itemGet({
      access_token: accessToken,
    });

    const institutionId = itemResponse.data.item.institution_id;
    if (institutionId == null) {
      return;
    }

    const institutionResponse = await plaidClient.institutionsGetById({
      institution_id: institutionId,
      country_codes: PLAID_COUNTRY_CODES,
    });

    const institutionName = institutionResponse.data.institution.name;

    const existingItem = await ItemModel.findOne({
      name: institutionName,
      user: userId,
    }).exec();

    if (existingItem) {
      console.log(
        `Bank ${institutionName} already exists for user ${userId}. Skipping item creation.`
      );
      return;
    }

    const institutionNameWithoutBankSuffix = removeBankSuffix(institutionName);

    const savedBankLogo = await PLaidBankLogoModel.findOne({
      name:
        institutionNameWithoutBankSuffix.toLowerCase() ?? name.toLowerCase(),
    });

    const institutionLogo =
      institutionResponse.data.institution.logo ?? savedBankLogo?.logo ?? null;

    // Creating Item in database
    const newItem = await ItemModel.create({
      itemId,
      user: userId,
      name: institutionName ?? name,
      formatName: institutionNameWithoutBankSuffix,
      accessToken,
      logo: institutionLogo,
    });

    if (foundUser) {
      foundUser.items.push(newItem._id);
      await foundUser.save();
    }
  } catch (error) {
    console.log(`Error in populating Item database: ${error}`);
  }
};

// Function to populate Account database
const populateAccountDatabase = async ({
  accessToken,
  userId,
}: {
  accessToken: string;
  userId: string;
}) => {
  try {
    const itemResponse = await plaidClient.itemGet({
      access_token: accessToken,
    });

    const institutionId = itemResponse.data.item.institution_id;
    if (institutionId == null) {
      return;
    }

    const institutionResponse = await plaidClient.institutionsGetById({
      institution_id: institutionId,
      country_codes: PLAID_COUNTRY_CODES,
    });

    const itemName = institutionResponse.data.institution.name;

    const item = await ItemModel.findOne({
      user: userId,
      name: itemName,
    }).exec();

    if (!item) {
      console.log(`Item not found or created for user ${userId}`);
      return;
    }

    const acctsResponse = await plaidClient.accountsGet({
      access_token: accessToken,
    });

    const accounts = acctsResponse.data.accounts;

    const accountNames = accounts.map((acc) => acc.official_name || acc.name);

    const existingAccount = item.name === itemName ? item.accountNames : [];

    const newAccounts = accountNames.filter(
      (name) => !existingAccount.includes(name)
    );

    if (newAccounts.length > 0) {
      const latestAcc = await Promise.all(
        accounts.map(
          async (acc) =>
            await AccountModel.create({
              accountId: acc.account_id,
              item: item._id,
              user: userId,
              balance: acc.balances.available ?? acc.balances.current,
              name: acc.official_name ?? acc.name,
              mask: acc.mask,
              type: acc.type,
              subType: acc.subtype,
              currency: acc.balances.iso_currency_code,
              limit: acc.balances.limit,
              lastBalanceUpdate: acc.balances.last_updated_datetime,
            })
        )
      );

      await ItemModel.updateOne(
        { name: itemName, user: userId },
        {
          $addToSet: {
            accountNames: { $each: newAccounts },
            accounts: latestAcc.map((acc) => acc._id),
          },
        }
      );
    } else {
      console.log(
        `No New Account found for ${itemName}, skippping account creation`
      );
    }
  } catch (error) {
    console.log(`Error in populating Account database: ${error}`);
  }
};
