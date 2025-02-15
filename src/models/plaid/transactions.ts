import mongoose, { Document, Schema } from "mongoose";

export interface ITransaction extends Document {
  user: mongoose.Schema.Types.ObjectId;
  account: mongoose.Schema.Types.ObjectId;
  item: mongoose.Schema.Types.ObjectId;
  amount: number;
  currency: string;
  isRemoved: boolean;
  type: "Debit" | "Credit";
  date: string;
  // Not Reqd
  transactionId: string;
  accountId: string;
  accountOwner: string;
  category: string;
  categoryId: string;
  categoryLogo: string;
  merchantId: string;
  merchantName: string;
  merchantLogo: string;
  merchantWebsite: string;
  paymentMode: string;
}

const transactionSchema: Schema<ITransaction> = new Schema({
  amount: { type: Number, required: true },
  type: { type: String, required: true, enum: ["Debit", "Credit"] },
  currency: { type: String, required: true },
  account: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Account",
    required: true,
  },
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Item",
    required: true,
  },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: String, required: true },
  isRemoved: { type: Boolean, required: true, default: false },

  transactionId: { type: String },
  accountId: { type: String },
  accountOwner: { type: String },
  category: { type: String },
  categoryId: { type: String },
  categoryLogo: { type: String },
  merchantId: { type: String },
  merchantName: { type: String },
  merchantLogo: { type: String },
  merchantWebsite: { type: String },
  paymentMode: { type: String },
});

const Transaction = mongoose.model<ITransaction>(
  "Transaction",
  transactionSchema
);

export default Transaction;
