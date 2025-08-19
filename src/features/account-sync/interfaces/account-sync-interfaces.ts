import { Coin } from "@/global-interfaces";

export interface AccountSync {
  uid: string;
  perpetualLastSyncTime: number;
  coin: Coin;
}

export type AccountSyncDocument = AccountSync & {
  _id: string;
};
