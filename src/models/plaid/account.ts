import mongoose, { Document, Schema } from "mongoose";

interface IAccount extends Document {
  accountNumber: string;
  accountType: string;
  item: mongoose.Schema.Types.ObjectId; // Reference to Item (Bank)
  transactions: mongoose.Schema.Types.ObjectId[]; // References to transactions
  createdAt: Date;
}

const accountSchema: Schema<IAccount> = new Schema({
  accountNumber: { type: String, required: true },
  accountType: { type: String, required: true },
  item: { type: mongoose.Schema.Types.ObjectId, ref: "Item", required: true },
  transactions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Transaction" }],
  createdAt: { type: Date, default: Date.now },
});

const Account = mongoose.model<IAccount>("Account", accountSchema);

export default Account;
