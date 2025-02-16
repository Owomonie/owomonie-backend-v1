import { Request, Response } from "express";

import UserModel from "../../models/user";

export const handleGetUserBanks = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    //@ts-ignore
    const userId = req.user.userId;

    const user = await UserModel.findById(userId)
      .populate({
        path: "items",
        populate: {
          path: "accounts",
        },
      })
      .exec();

    if (!user) {
      res.status(404).json({ success: false, message: "User Not Found" });
      return;
    }

    if (user.items?.length <= 0) {
      res.status(404).json({
        success: false,
        message: "No Banks Availiable for this users",
      });
      return;
    }

    let totalBalance = 0;
    const allBanksData = user.items.map((bank) => {
      const bankTotalBalance = bank.accounts.reduce(
        (sum, account) => sum + account.balance,
        0
      );
      totalBalance += bankTotalBalance;

      return {
        id: bank._id,
        logo: bank.logo,
        createdAt: bank.createdAt,
      };
    });

    res.status(200).json({
      success: true,
      data: { banks: allBanksData, balance: totalBalance },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const handleGetUserAccounts = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    //@ts-ignore
    const userId = req.user.userId;

    const user = await UserModel.findById(userId)
      .populate({
        path: "items",
        populate: {
          path: "accounts",
        },
      })
      .exec();

    if (!user) {
      res.status(404).json({ success: false, message: "User Not Found" });
      return;
    }

    if (user.items?.length <= 0) {
      res.status(404).json({
        success: false,
        message: "No Banks Availiable for this users",
      });
      return;
    }

    const accountData = user.items.flatMap((bank) =>
      bank.accounts.map((account) => ({
        id: account._id,
        bankName: bank.name,
        bankLogo: bank.logo,
        balance: account.balance,
        accountNo: account.mask,
        createdAt: account.createdAt,
      }))
    );

    res.status(200).json({
      success: true,
      data: accountData,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const handleGetUserTransaction = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    //@ts-ignore
    const userId = req.user.userId;

    const user = await UserModel.findById(userId)
      .populate({
        path: "items",
        populate: {
          path: "accounts",
          populate: {
            path: "transactions",
          },
        },
      })
      .exec();

    if (!user) {
      res.status(404).json({ success: false, message: "User Not Found" });
      return;
    }

    if (user.items?.length <= 0) {
      res.status(404).json({
        success: false,
        message: "No Banks Availiable for this user",
      });
      return;
    }

    const transactionData = user.items.flatMap((item) =>
      item.accounts.flatMap((account) =>
        account.transactions.map((txn) => ({
          id: txn._id,
          category: txn.category,
          amount: txn.amount,
          date: txn.dateTime ?? txn.date,
          categoryUri: txn.categoryLogo,
          bankName: item.formatName,
          type: txn.type,
          createdAt: txn.createdAt,
        }))
      )
    );

    if (transactionData.length === 0) {
      res
        .status(404)
        .json({ success: false, message: "No transactions found" });
      return;
    }

    res.status(200).json({
      success: true,
      data: transactionData,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
