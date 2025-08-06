import mongoose from "mongoose";
import { AccountSyncModel } from "@/features/account-sync/model/account-sync";
import { Coin } from "@/global-interfaces";

export const createOrUpdateAccountSync = (
  uid: string,
  time: number,
  coin: Coin,
  session: mongoose.ClientSession,
) => {
  return AccountSyncModel.findOneAndUpdate(
    { uid, coin },
    { perpetualLastSyncTime: time },
    { upsert: true, new: true, session },
  );
};

export const getAccountSync = (uid: string, coin: Coin) => {
  return AccountSyncModel.findOne({ uid, coin });
};
