import mongoose, { Document, Schema } from "mongoose";

export interface ITransaction extends Document {
  date: Date;
  name: string;
  amount: number;
  currency: "USD";
  isRemoved: boolean;
  type: "Debit" | "Credit";
  description: string;
  account: mongoose.Schema.Types.ObjectId; // Reference to Account
  user: mongoose.Schema.Types.ObjectId; // Reference to User
  categories: [string];
}

const transactionSchema: Schema<ITransaction> = new Schema({
  date: { type: Date, required: true },
  amount: { type: Number, required: true },
  type: { type: String, required: true, enum: ["Debit", "Credit"] },
  description: { type: String, required: true },
  account: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Account",
    required: true,
  },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  categories: { type: [String] },
});

const Transaction = mongoose.model<ITransaction>(
  "Transaction",
  transactionSchema
);

export default Transaction;
