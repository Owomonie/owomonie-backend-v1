import mongoose, { Document, Schema } from "mongoose";

interface IBankSchema extends Document {
  bankName: string;
  bankSortCode: string;
  bankLogo: string;
  createdAt?: Date;
}

const BankSchema = new Schema<IBankSchema>({
  bankName: {
    type: String,
    required: true,
  },

  bankSortCode: {
    type: String,
    required: true,
  },

  bankLogo: {
    type: String,
  },

  createdAt: { type: Date, default: Date.now },
});

const BankModel = mongoose.model<IBankSchema>("Bank", BankSchema);

export default BankModel;
