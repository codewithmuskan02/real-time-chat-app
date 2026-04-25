import { Schema, model, Document, Types } from "mongoose";

export interface IPushSubscription {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  avatar?: string;
  refreshToken?: string;
  subscriptions: IPushSubscription[];
  createdAt: Date;
  updatedAt: Date;
}

const subscriptionSchema = new Schema<IPushSubscription>(
  {
    endpoint: { type: String, required: true },
    keys: {
      p256dh: { type: String, required: true },
      auth: { type: String, required: true },
    },
  },
  { _id: false }
);

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, index: true, lowercase: true },
    password: { type: String, required: true },
    avatar: { type: String },
    refreshToken: { type: String },
    subscriptions: { type: [subscriptionSchema], default: [] },
  },
  { timestamps: true }
);

export const User = model<IUser>("User", userSchema);
