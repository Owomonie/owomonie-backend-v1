import mongoose, { Document, Schema } from "mongoose";

interface IOtpSchema extends Document {
  email: string;
  otp: string;
  otpExpiry: Date;
  sessionId: string;
}

const otpSchema = new Schema<IOtpSchema>({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  otpExpiry: { type: Date, required: true },
  sessionId: { type: String, required: true },
});

const OtpModel = mongoose.model<IOtpSchema>("Otp", otpSchema);

export default OtpModel;
