import mongoose, { Document, Schema } from "mongoose";
import { IAccount } from "./account";

export interface IItem extends Document {
  itemId: string;
  name: string;
  formatName: string;
  user: mongoose.Schema.Types.ObjectId;
  accounts: IAccount[];
  accountNames: string[];
  accessToken: string;
  logo: string | null;
  transactionCursor: string | undefined;
  isActive: boolean;
  createdAt: Date;
}

const itemSchema: Schema<IItem> = new Schema({
  itemId: { type: String, required: true },
  name: { type: String, required: true },
  formatName: { type: String },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  accounts: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Account", required: true },
  ],
  accountNames: [{ type: String, required: true }],
  accessToken: { type: String, required: true },
  transactionCursor: { type: String },
  logo: { type: String },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

const ItemModel = mongoose.model<IItem>("Item", itemSchema);

export default ItemModel;
