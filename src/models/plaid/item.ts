import mongoose, { Document, Schema } from "mongoose";

interface IItem extends Document {
  name: string;
  user: mongoose.Schema.Types.ObjectId;
  accounts: mongoose.Schema.Types.ObjectId[];
  accessToken: string;
  plaidItemId: string;
  logo: string | null;
  transactionCursor: string | null;
  createdAt: Date;
}

const itemSchema: Schema<IItem> = new Schema({
  name: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  accounts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Account" }],
  plaidItemId: { type: String, required: true, unique: true },
  accessToken: { type: String, required: true },
  transactionCursor: { type: String, required: true },
  logo: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const Item = mongoose.model<IItem>("Item", itemSchema);

export default Item;
