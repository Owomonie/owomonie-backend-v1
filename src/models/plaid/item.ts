import mongoose, { Document, Schema } from "mongoose";

interface IItem extends Document {
  itemId: string;
  name: string;
  formatName: string;
  user: mongoose.Schema.Types.ObjectId;
  accounts: mongoose.Schema.Types.ObjectId[];
  accountNames: string[];
  accessToken: string;
  logo: string | null;
  transactionCursor: string | null;
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
  createdAt: { type: Date, default: Date.now },
});

const ItemModel = mongoose.model<IItem>("Item", itemSchema);

export default ItemModel;
