import { Request, Response } from "express";
import BankModel from "../../models/bank";
import { deleteBankLogo } from "../../aws/bank-logo";

export const handleDeleteBank = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { bankId } = req.params; // Get the bank ID from the request parameters

    if (!bankId) {
      res.status(400).json({ success: false, message: "Missing Bank ID" });
      return;
    }

    const foundBank = await BankModel.findById(bankId).exec(); // Corrected here

    if (!foundBank) {
      res.status(404).json({ success: false, message: "Bank Not Found" });
      return;
    }

    if (foundBank.bankLogo) {
      await deleteBankLogo(foundBank.bankLogo);
    }

    await BankModel.findByIdAndDelete(bankId).exec(); // Corrected here

    res
      .status(200)
      .json({ success: true, message: "Bank Deleted Successfully" });
  } catch (error) {
    console.error("Error deleting bank:", error); // Log the error for debugging
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
