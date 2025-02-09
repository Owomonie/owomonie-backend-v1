import mongoose, { Document, Schema } from "mongoose";

interface IPLaidBankLogoSchema extends Document {
  name: string;
  logo: string;
  createdAt?: Date;
}

const PLaidBankLogoSchema = new Schema<IPLaidBankLogoSchema>({
  name: {
    type: String,
    required: true,
  },

  logo: {
    type: String,
    required: true,
  },

  createdAt: { type: Date, default: Date.now },
});

const PLaidBankLogoModel = mongoose.model<IPLaidBankLogoSchema>(
  "PLaidBankLogo",
  PLaidBankLogoSchema
);

export default PLaidBankLogoModel;
