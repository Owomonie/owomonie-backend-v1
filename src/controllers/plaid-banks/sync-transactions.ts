import { Transaction, RemovedTransaction } from "plaid";
import ItemModel from "../../models/plaid/item";
import { plaidClient } from "../../config/plaid";
import TransactionModel from "../../models/plaid/transactions";
import AccountModel from "../../models/plaid/account";
import { removeUnderScore } from "../../utils/remove-underscores";

export const syncTransactions = async ({ itemName }: { itemName: string }) => {
  const item = await ItemModel.findOne({
    $or: [{ name: itemName }, { itemId: itemName }],
  }).exec();

  const accounts = await AccountModel.find();

  if (!item) {
    console.log("Bank does not exist in our database");
    return;
  }

  const transactionData = await fetchNewSyncData({
    accessToken: item?.accessToken,
    bankName: item.name,
    initialCursor: item.transactionCursor,
  });

  await Promise.all(
    transactionData.added.map(async (txnObj) => {
      const transactionId = txnObj.transaction_id;
      const amount = Math.abs(txnObj.amount);
      const type = txnObj.amount > 0 ? "Debit" : "Credit";

      const category =
        txnObj.personal_finance_category?.primary &&
        removeUnderScore(txnObj.personal_finance_category?.primary);

      const account = accounts.find(
        (acc) => acc.accountId === txnObj.account_id
      );

      if (account) {
        const existingTxn = await TransactionModel.findOne({
          transactionId,
        }).exec();

        if (!existingTxn) {
          const newTxn = await TransactionModel.create({
            transactionId,
            user: item.user,
            account: account._id,
            item: item._id,
            amount,
            type,
            currency:
              txnObj.iso_currency_code ??
              txnObj.unofficial_currency_code ??
              "GBP",
            date: txnObj.authorized_date ?? txnObj.date,
            pending: txnObj.pending,
            pendingTxnId: txnObj.pending_transaction_id,
            description: txnObj.original_description,
            accountId: txnObj.account_id,
            accountOwner: txnObj.account_owner,
            category,
            categoryLogo: txnObj.personal_finance_category_icon_url,
            merchantId: txnObj.merchant_entity_id,
            merchantName: txnObj.merchant_name ?? txnObj.name,
            merchantLogo: txnObj.logo_url,
            merchantWebsite: txnObj.website,
            paymentMode: txnObj.payment_channel,
            dateTime: txnObj.authorized_datetime ?? txnObj.datetime,
            location: txnObj.location,
          });

          console.log(`Added new transaction: ${transactionId}`);

          await AccountModel.updateOne(
            { accountId: account.accountId, user: account.user },
            {
              $addToSet: {
                transactions: newTxn._id,
              },
            }
          );
        } else {
          console.log(`Transaction ${transactionId} already exists.`);
        }
      }
    })
  );

  await Promise.all(
    transactionData.modified.map(async (txnObj) => {
      const account = accounts.find(
        (acc) => acc.accountId === txnObj.account_id
      );
      const transactionId = txnObj.transaction_id;
      const amount = Math.abs(txnObj.amount);
      const type = txnObj.amount > 0 ? "Debit" : "Credit";

      const category =
        txnObj.personal_finance_category?.primary &&
        removeUnderScore(txnObj.personal_finance_category?.primary);

      if (account) {
        const existingTxn = await TransactionModel.findOne({
          transactionId,
        }).exec();

        if (existingTxn) {
          existingTxn.amount = amount;
          existingTxn.type = type;
          existingTxn.currency =
            txnObj.iso_currency_code ??
            txnObj.unofficial_currency_code ??
            "GBP";
          existingTxn.date = txnObj.authorized_date ?? txnObj.date;
          existingTxn.pending = txnObj.pending;
          existingTxn.merchantName = txnObj.merchant_name ?? txnObj.name;
          existingTxn.paymentMode = txnObj.payment_channel;
          existingTxn.accountId = txnObj.account_id;
          existingTxn.category = category;

          if (txnObj.pending_transaction_id) {
            existingTxn.pendingTxnId = txnObj.pending_transaction_id;
          }

          if (txnObj.original_description) {
            existingTxn.description = txnObj.original_description;
          }

          if (txnObj.account_owner) {
            existingTxn.accountOwner = txnObj.account_owner;
          }

          if (txnObj.personal_finance_category_icon_url) {
            existingTxn.categoryLogo =
              txnObj.personal_finance_category_icon_url;
          }

          if (txnObj.merchant_entity_id) {
            existingTxn.merchantId = txnObj.merchant_entity_id;
          }

          if (txnObj.logo_url) {
            existingTxn.merchantLogo = txnObj.logo_url;
          }

          if (txnObj.website) {
            existingTxn.merchantWebsite = txnObj.website;
          }

          if (txnObj.authorized_datetime || txnObj.datetime) {
            existingTxn.dateTime =
              txnObj.authorized_datetime ?? txnObj.datetime;
          }

          if (txnObj.location) {
            existingTxn.location = txnObj.location;
          }
          // Save the updated transaction
          await existingTxn.save();
          console.log(`Updated existing transaction: ${transactionId}`);
        } else {
          console.log(`Transaction ${transactionId} not found for update.`);
        }
      }
    })
  );

  await Promise.all(
    transactionData.removed.map(async (txnObj) => {
      const account = accounts.find(
        (acc) => acc.accountId === txnObj.account_id
      );

      const removedTxn = await TransactionModel.findOne({
        transactionId: txnObj.transaction_id,
      }).exec();

      if (account && removedTxn) {
        removedTxn.isRemoved = true;
        await removedTxn.save();
      }
    })
  );

  // Save our most recent cursor
  item.transactionCursor = transactionData.nextCursor;
  await item.save();
  console.log(`Transaction Data Updated Successfully`);
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
