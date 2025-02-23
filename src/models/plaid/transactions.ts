import mongoose, { Document, Schema } from "mongoose";

export interface ITransaction extends Document {
  transactionId: string;
  user: mongoose.Schema.Types.ObjectId;
  account: mongoose.Schema.Types.ObjectId;
  item: mongoose.Schema.Types.ObjectId;
  amount: number;
  currency: string;
  isRemoved: boolean;
  type: "Debit" | "Credit";
  date: string;
  pending: boolean;
  // Not Reqd
  pendingTxnId: string;
  description: string;
  accountId: string;
  accountOwner: string;
  category: string | undefined;
  categoryLogo: string;
  merchantId: string;
  merchantName: string;
  merchantLogo: string;
  merchantWebsite: string;
  paymentMode: string;
  dateTime: string | null;
  location: {
    address: string | null;
    city: string | null;
    country: string | null;
    lat: number | null;
    lon: number | null;
    postal_code: string | null;
    region: string | null;
    store_number: string | null;
  };
  createdAt: Date;
}

const transactionSchema: Schema<ITransaction> = new Schema({
  transactionId: { type: String, required: true },
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
  pending: { type: Boolean, required: true },

  pendingTxnId: { type: String },
  description: { type: String },
  accountId: { type: String },
  accountOwner: { type: String },
  category: { type: String },
  categoryLogo: { type: String },
  merchantId: { type: String },
  merchantName: { type: String },
  merchantLogo: { type: String },
  merchantWebsite: { type: String },
  paymentMode: { type: String },
  dateTime: { type: String },
  location: {
    address: { type: String },
    city: { type: String },
    country: { type: String },
    lat: { type: Number },
    lon: { type: Number },
    postal_code: { type: String },
    region: { type: String },
    store_number: { type: String },
  },
  createdAt: { type: Date, default: Date.now },
});

transactionSchema.index({ date: -1 });

const TransactionModel = mongoose.model<ITransaction>(
  "Transaction",
  transactionSchema
);

export default TransactionModel;
