import { Request, Response } from "express";
import BankModel from "../../models/bank";
import { uploadBankLogo } from "../../aws/bank-logo";

export const handleCreateNewBank = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { bankName, bankSortCode } = req.body;
    const file = req.file;

    if (!bankName || !bankSortCode) {
      res
        .status(400)
        .json({ success: false, message: "Missing Bank Credentials" });
      return;
    }

    if (bankSortCode.length !== 6) {
      // Check if bankSortCode is a string of length 6
      res.status(400).json({
        success: false,
        message: `Invalid Bank Code`,
      });
      return;
    }

    const foundBank = await BankModel.findOne({
      $or: [{ bankName }, { bankSortCode }],
    }).exec();

    if (foundBank) {
      res.status(409).json({ success: false, message: "Bank Already Exists" });
      return;
    }

    const bankLogo = file && (await uploadBankLogo(file, bankSortCode));

    await BankModel.create({
      bankName,
      bankSortCode,
      bankLogo,
    });

    res
      .status(201)
      .json({ success: true, message: `Bank Created Successfully` });
  } catch (error) {
    console.error("Error creating bank:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
