import mongoose, { Document, Schema } from "mongoose";

interface INotificationSchema extends Document {
  body: string;
  title: string;
  recipient?: mongoose.Types.ObjectId | string;
  sender: mongoose.Types.ObjectId;
  type: number;
  status: number;
  totalReceivers: number;
  categories: string[];
  createdAt: Date;
}

const notificationSchema = new Schema<INotificationSchema>({
  body: { type: String, required: true },
  title: { type: String, required: true },
  recipient: {
    type: Schema.Types.Mixed,
    required: true,
  },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: Number, required: true },
  status: { type: Number, required: true },
  totalReceivers: { type: Number, required: true },
  categories: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
});

const NotificationModel = mongoose.model<INotificationSchema>(
  "Notification",
  notificationSchema
);

export default NotificationModel;
