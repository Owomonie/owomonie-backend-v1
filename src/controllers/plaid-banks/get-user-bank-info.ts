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
          //   populate: {
          //     path: "transactions",
          //     model: "Transaction",
          //   },
        },
      })
      .exec();

    if (!user) {
      res.status(404).json({ success: false, message: "User Not Found" });
      return;
    }

    const accountData = user.items.flatMap((bank) =>
      bank.accounts.map((account) => ({
        bankName: bank.name,
        bankLogo: bank.logo,
        accountId: account._id,
        balance: account.balance,
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
