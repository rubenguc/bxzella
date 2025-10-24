import mongoose, { Schema } from "mongoose";
import type { Account } from "../interfaces/accounts-interfaces";

export const AccountSchema = new Schema<Account>({
  userId: {
    type: String,
    required: true,
  },
  name: {
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
  provider: {
    type: String,
    required: true,
  },
  lastSyncPerCoin: {
    type: Schema.Types.Mixed, // Record<Coin, number>
    default: {},
  },
  earliestTradeDatePerCoin: {
    type: Schema.Types.Mixed, // Record<Coin, Date>
    default: {},
  },
});

AccountSchema.index({ userId: 1, apiKey: 1, secretKey: 1 }, { unique: true });
AccountSchema.index({ userId: 1, name: 1 });

export const AccountModel =
  mongoose.models.Account || mongoose.model("Account", AccountSchema);
