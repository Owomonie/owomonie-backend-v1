import mongoose, { Document, Schema } from "mongoose";

interface IPlaidBankSchema extends Document {
  bankName: string;
  bankSortCode: string;
  bankLogo: string;
}

const PlaidBankSchema = new Schema<IPlaidBankSchema>({
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
});

const BankModel = mongoose.model<IPlaidBankSchema>(
  "Plaid Banks",
  PlaidBankSchema
);

export default BankModel;
