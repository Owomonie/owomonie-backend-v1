import { Request, Response } from "express";
import TransactionModel from "../../models/plaid/transactions";
import UserModel from "../../models/user";
import ItemModel from "../../models/plaid/item";

export const handleGetAllTransactions = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Get startDate, endDate, page, and limit from query parameters
    let { startDate, endDate, page = 1, limit = 20 } = req.query;

    // Ensure both startDate and endDate are provided
    const currentDate = new Date();
    if (!startDate || !endDate) {
      const start = new Date(currentDate);
      start.setMonth(currentDate.getMonth() - 1);
      const end = new Date(currentDate);
      startDate = start.toISOString().split("T")[0];
      endDate = end.toISOString().split("T")[0];
    }

    // Parse the start and end date strings into Date objects
    const start = new Date(startDate as string);
    const end = new Date(endDate as string);

    // Check if the dates are valid
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      res.status(400).json({ success: false, message: "Invalid date format" });
      return;
    }

    // Convert page and limit to integers
    const pageNumber = parseInt(page as string, 10);
    const pageLimit = parseInt(limit as string, 10);

    // Validate page and limit numbers
    if (pageNumber < 1 || pageLimit < 1) {
      res.status(400).json({
        success: false,
        message: "Page number and limit must be greater than 0",
      });
      return;
    }

    // Calculate skip (offset) for pagination
    const skip = (pageNumber - 1) * pageLimit;

    // Query the transactions within the date range and apply pagination
    const transactions = await TransactionModel.find({
      date: {
        $gte: start.toISOString().split("T")[0],
        $lte: end.toISOString().split("T")[0],
      },
    })
      .skip(skip)
      .limit(pageLimit);

    // Count total transactions for pagination metadata
    const totalTransactions = await TransactionModel.countDocuments({
      date: {
        $gte: start.toISOString().split("T")[0],
        $lte: end.toISOString().split("T")[0],
      },
    });

    const transactionDataPromises = transactions.map(async (txn) => {
      const user = await UserModel.findById(txn.user);
      const bank = await ItemModel.findById(txn.item);

      return {
        id: txn._id,
        userId: txn.user,
        firstName: user?.firstName,
        lastName: user?.lastName,
        date: txn.dateTime ?? txn.date,
        type: txn.type,
        amount: txn.amount,
        category: txn.category,
        bank: bank?.formatName ?? bank?.name,
      };
    });

    const transactionData = await Promise.all(transactionDataPromises);

    transactionData.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateB.getTime() - dateA.getTime(); // Descending order
    });

    // Return the paginated transactions and metadata
    res.status(200).json({
      success: true,
      data: {
        totalPages: Math.ceil(totalTransactions / pageLimit),
        transactions: transactionData,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
