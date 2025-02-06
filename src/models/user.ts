import mongoose, { Document, Schema } from "mongoose";

interface IUserSchema extends Document {
  userName?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  avatar?: string;
  status?: number;
  password?: string;
  createdAt?: Date;
  otp?: string;
  otpExpiry?: Date;
  resettingPassword?: boolean;
  isAdmin: boolean;
  gender?: string;
  ageRange?: string;
  workType?: string;
  incomeRange?: string;
  pushToken?: string;
  lastLogin?: Date;
  loginToken?: string;
  items: mongoose.Schema.Types.ObjectId[];
}

const userSchema = new Schema<IUserSchema>({
  firstName: {
    type: String,
  },

  lastName: {
    type: String,
  },

  userName: {
    type: String,
  },

  email: {
    type: String,
    required: true,
  },

  otp: { type: String },

  otpExpiry: { type: Date },

  avatar: {
    type: String,
  },

  status: {
    type: Number,
    default: 0,
  },

  isAdmin: { type: Boolean, default: false },

  password: {
    type: String,
  },

  resettingPassword: {
    type: Boolean,
  },

  gender: {
    type: String,
  },

  ageRange: {
    type: String,
  },

  workType: {
    type: String,
  },

  incomeRange: {
    type: String,
  },

  pushToken: {
    type: String,
  },

  createdAt: { type: Date, default: Date.now },

  lastLogin: { type: Date, default: null },

  loginToken: {
    type: String,
  },

  items: [{ type: mongoose.Schema.Types.ObjectId, ref: "Item" }],
});

const UserModel = mongoose.model<IUserSchema>("User", userSchema);

export default UserModel;
