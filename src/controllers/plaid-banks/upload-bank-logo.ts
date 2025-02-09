import { Request, Response } from "express";
import { uploadPlaidBankLogo } from "../../aws/plaid-bank-logos";
import PLaidBankLogoModel from "../../models/plaid/logo";

export const handleCreatePLaidBankLogo = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name } = req.body;
    const file = req.file;

    if (!name) {
      res.status(400).json({ success: false, message: "Missing Bank Name" });
      return;
    }

    if (!file) {
      res.status(400).json({ success: false, message: "Image not found" });
      return;
    }

    const foundBankLogo = await PLaidBankLogoModel.findOne({
      name,
    }).exec();

    if (foundBankLogo) {
      res.status(409).json({ success: false, message: "Bank's Logo Exist" });
      return;
    }

    const logo = file && (await uploadPlaidBankLogo(file, name));

    await PLaidBankLogoModel.create({
      name,
      logo,
    });

    res
      .status(201)
      .json({ success: true, message: `Bank's Logo Successfully Saved` });
  } catch (error) {
    console.error("Error creating bank's logo:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
