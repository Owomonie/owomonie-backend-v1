import { Request, Response } from "express";
import BankModel from "../../models/bank";

export const handleGetAllBanks = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const banks = await BankModel.find();

    res.status(200).json({ success: true, banks });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
