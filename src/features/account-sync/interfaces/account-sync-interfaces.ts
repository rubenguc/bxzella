export interface AccountSync {
  uid: string;
  perpetualLastSyncTime: number;
}

export type AccountSyncDocument = AccountSync & {
  _id: string;
};
