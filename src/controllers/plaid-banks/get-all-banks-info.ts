import { Request, Response } from "express";

import UserModel from "../../models/user";
import TransactionModel from "../../models/plaid/transactions";

export const handleGetAllTransactiions = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const transactions = await TransactionModel.find();

    res.status(200).json({
      success: true,
      data: transactions,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
