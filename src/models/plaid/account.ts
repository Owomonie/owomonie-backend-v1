import mongoose, { Document, Schema } from "mongoose";
import { ITransaction } from "./transactions";

export interface IAccount extends Document {
  accountId: string;
  balance: number;
  user: mongoose.Schema.Types.ObjectId;
  item: mongoose.Schema.Types.ObjectId;
  transactions: ITransaction[];
  category: string;
  name: string;
  mask: string;
  type: string;
  subType: string;
  currency: string;
  limit: number;
  lastBalanceUpdate: Date;
  createdAt: Date;
}

const accountSchema: Schema<IAccount> = new Schema({
  accountId: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  balance: { type: Number, required: true },
  item: { type: mongoose.Schema.Types.ObjectId, ref: "Item", required: true },
  transactions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Transaction" }],
  category: { type: String },
  name: { type: String, required: true },
  mask: { type: String },
  type: { type: String },
  subType: { type: String },
  currency: { type: String },
  limit: { type: Number },
  lastBalanceUpdate: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

const AccountModel = mongoose.model<IAccount>("Account", accountSchema);

export default AccountModel;
