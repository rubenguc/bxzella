import mongoose, { Schema } from "mongoose";

export interface IAccountModel {
  userId: string;
  name: string;
  apiKey: string;
  secretKey: string;
  uid: string;
}

export const AccountSchema = new Schema<IAccountModel>({
  userId: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  uid: {
    type: String,
    required: true,
  },
  apiKey: {
    type: String,
    required: true,
  },
  secretKey: {
    type: String,
    required: true,
  },
});

AccountSchema.index({ userId: 1, name: 1 });

export const AccountModel =
  mongoose.models.Account || mongoose.model("Account", AccountSchema);
