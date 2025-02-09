import { Request, Response } from "express";
import escape from "escape-html";

import UserModel from "../../models/user";
import ItemModel from "../../models/plaid/item";

import { PLAID_COUNTRY_CODES, plaidClient } from "../../config/plaid";
import { sendPushNotification } from "../../expo-push-notification/notification";
import GeneralMessage from "../../email/general/message";
import removeBankSuffix from "./../../utils/bankSuffixRemove";

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

    await populateItem({
      accessToken: tokenResponse.data.access_token,
      itemId: tokenResponse.data.item_id,
      userId,
      name: bankNameWithoutBankSuffix,
    });

    const accountSuffix = numberOfAccounts === 1 ? "account" : "accounts";

    const body = `Hi ${foundUser.firstName}, ${numberOfAccounts} ${accountSuffix} have been successfully linked from ${bankNameWithoutBankSuffix} Bank`;
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

const populateItem = async ({
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

    console.log(institutionResponse);

    const institutionName = institutionResponse.data.institution.name;
    const institutionLogo = institutionResponse.data.institution.logo ?? "";
    const institutionNameWithoutBankSuffix = removeBankSuffix(institutionName);

    // await ItemModel.create({
    //   id: itemId,
    //   user: userId,
    //   name: institutionName ?? name,
    //   accessToken,
    // });
  } catch (error) {
    console.log(`Ran into an error! ${error}`);
  }
};

// const populateAccountNames = async (accessToken) => {
//   try {
//     const acctsResponse = await plaidClient.accountsGet({
//       access_token: accessToken,
//     });
//     const acctsData = acctsResponse.data;
//     const itemId = acctsData.item.item_id;
//     await Promise.all(
//       acctsData.accounts.map(async (acct) => {
//         await db.addAccount(acct.account_id, itemId, acct.name);
//       })
//     );
//   } catch (error) {
//     console.log(`Ran into an error! ${error}`);
//   }
// };
