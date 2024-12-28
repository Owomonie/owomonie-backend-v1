import mongoose, { Document, Schema } from "mongoose";

interface IPushTokenSchema extends Document {
  pushToken: string;
}

const pushTokenSchema = new Schema<IPushTokenSchema>({
  pushToken: { type: String, required: true },
});

const PushTokenModel = mongoose.model<IPushTokenSchema>(
  "Push Token",
  pushTokenSchema
);

export default PushTokenModel;
