import mongoose, { Schema } from "mongoose";

export interface IAccountSyncModel {
  uid: string;
  perpetualLastSyncTime: number;
}

export const AccounSyncSchema = new Schema<IAccountSyncModel>({
  uid: {
    type: String,
    required: true,
  },
  perpetualLastSyncTime: {
    type: Number,
    required: true,
  },
});

export const AccountSyncModel =
  mongoose.models.AccountSync ||
  mongoose.model("AccountSync", AccounSyncSchema);
