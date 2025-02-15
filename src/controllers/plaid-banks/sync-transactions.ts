import { Request, Response } from "express";
import { Transaction, RemovedTransaction } from "plaid";

import UserModel from "../../models/user";
import ItemModel from "../../models/plaid/item";
import { plaidClient } from "../../config/plaid";

// const handleSyncTransactions = async (
//   req: Request,
//   res: Response
// ): Promise<void> => {
//   //@ts-ignore
//   const userId = req.user.userId;

//   const user = await UserModel.findById(userId)
//     .populate({ path: "items" })
//     .exec();

//   if (!user) {
//     res.status(404).json({ success: false, message: "User Not Found" });
//     return;
//   }

//   if (user.items?.length <= 0) {
//     res.status(404).json({
//       success: false,
//       message: "No Banks Availiable for this users",
//     });
//     return;
//   }

//   const fullResults = await Promise.all(
//     user.items.map(async (item) => {
//       return await syncTransactions({ itemId: item.itemId });
//     })
//   );
// };

export const syncTransactions = async ({ itemName }: { itemName: string }) => {
  const summary = { added: 0, removed: 0, modified: 0 };
  console.log(itemName);

  const item = await ItemModel.findOne({ name: itemName }).exec();

  if (!item) {
    console.log("Bank does not exist in our database");
    return;
  }

  const transactionData = await fetchNewSyncData({
    accessToken: item?.accessToken,
    bankName: item.name,
    initialCursor: item.transactionCursor,
  });

  await Promise.all(transactionData.added.map(async (txnObj) => {}));

  await Promise.all(transactionData.modified.map(async (txnObj) => {}));

  await Promise.all(transactionData.removed.map(async (txnObj) => {}));

  // Save our most recent cursor
};

const fetchNewSyncData = async ({
  accessToken,
  initialCursor,
  retriesLeft = 3,
  bankName,
}: {
  accessToken: string;
  initialCursor: string | undefined;
  bankName: string;
  retriesLeft?: number;
}) => {
  let keepGoing = false;
  const allData: {
    added: Transaction[];
    modified: Transaction[];
    removed: RemovedTransaction[];
    nextCursor: string | undefined;
  } = {
    added: [],
    modified: [],
    removed: [],
    nextCursor: initialCursor,
  };

  if (retriesLeft <= 0) {
    console.error(
      `Too many entries while fetching Transaction Data for ${bankName}`
    );
    return allData;
  }

  try {
    do {
      const results = await plaidClient.transactionsSync({
        access_token: accessToken,
        cursor: allData.nextCursor,
      });

      const newData = results.data;

      allData.added = allData.added.concat(newData.added);
      allData.modified = allData.modified.concat(newData.modified);
      allData.removed = allData.removed.concat(newData.removed);
      allData.nextCursor = newData.next_cursor;

      keepGoing = newData.has_more;

      console.log(
        `Added: ${newData.added.length} Modified: ${newData.modified.length} Removed: ${newData.removed.length}`
      );
    } while (keepGoing === true);

    console.log("Transaction Synced Successfully");
    console.log(`Your final Cursor: ${allData.nextCursor}`);
    return allData;
  } catch (error) {
    console.error("Error while fetching data:", error);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return fetchNewSyncData({
      accessToken,
      initialCursor,
      retriesLeft: retriesLeft - 1,
      bankName,
    });
  }
};
