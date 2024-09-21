import { Request, Response } from "express";

export const handleCreateNewBank = async (
  req: Request,
  res: Response
): Promise<void> => {
  res.json({ success: true, message: "Welcome, Admin! You can create a bank" });
};
