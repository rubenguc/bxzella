import mongoose, { Schema } from "mongoose";
import { Account } from "../interfaces/accounts-interfaces";

export const AccountSchema = new Schema<Account>({
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
