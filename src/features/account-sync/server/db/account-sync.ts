import mongoose from "mongoose";
import { AccountSyncModel } from "../../model/account-sync";

export const createOrUpdateAccountSync = (
  uid: string,
  time: number,
  session: mongoose.ClientSession,
) => {
  return AccountSyncModel.findOneAndUpdate(
    { uid },
    { perpetualLastSyncTime: time },
    { upsert: true, new: true, session },
  );
};

export const getAccountSync = (uid: string) => {
  return AccountSyncModel.findOne({ uid });
};
