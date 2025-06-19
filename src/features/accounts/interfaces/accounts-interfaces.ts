export interface Account {
  userId: string;
  name: string;
  apiKey: string;
  secretKey: string;
  uid: string;
}

export type AccountDocument = Account & {
  _id: string;
};
