import mongoose, { Schema } from "mongoose";
import { AccountSync } from "@/features/account-sync/interfaces/account-sync-interfaces";

export const AccounSyncSchema = new Schema<AccountSync>({
  uid: {
    type: String,
    required: true,
  },
  perpetualLastSyncTime: {
    type: Number,
    required: true,
  },
  coin: {
    type: String,
    required: true,
  },
});

export const AccountSyncModel =
  mongoose.models.AccountSync ||
  mongoose.model("AccountSync", AccounSyncSchema);
