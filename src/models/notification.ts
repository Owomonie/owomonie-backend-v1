import mongoose, { Document, Schema } from "mongoose";

interface INotificationSchema extends Document {
  body: string;
  title: string;
  recipients?: mongoose.Types.ObjectId[];
  userId: mongoose.Types.ObjectId;
  type: number;
  status: number;
  createdAt: Date;
}

const notificationSchema = new Schema<INotificationSchema>({
  body: { type: String, required: true },
  title: { type: String, required: true },
  recipients: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: Number, required: true },
  status: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

const NotificationModel = mongoose.model<INotificationSchema>(
  "Notification",
  notificationSchema
);

export default NotificationModel;
