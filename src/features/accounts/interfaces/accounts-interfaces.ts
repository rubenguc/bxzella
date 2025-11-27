import type { z } from "zod";
import type {
  Coin,
  PaginationResponse,
  Provider,
} from "@/interfaces/global-interfaces";
import type { accountValidationSchema } from "../schemas/accounts-schemas";

export interface Account {
  userId: string;
  name: string;
  apiKey: string;
  secretKey: string;
  provider: Provider;
  lastSyncPerCoin: Partial<Record<Coin, number>>;
  earliestTradeDatePerCoin: Partial<Record<Coin, Date>>;
}

export type AccountForm = z.infer<typeof accountValidationSchema>;

export type AccountDocument = Account & {
  _id: string;
};

export interface AccountItem extends Omit<Account, "apiKey" | "secretKey"> {}

// Queries

export interface GetAccountsByUserId {
  userId: string;
  page: number;
  limit: number;
}

export type GetAccountsByUserIdResponse = Promise<
  PaginationResponse<AccountItem>
>;

export interface SelectedAccount extends Pick<Account, "name" | "provider"> {
  _id: string;
  earliestTradeDatePerCoin: Partial<Record<Coin, Date | string>>;
  lastSyncPerCoin: Partial<Record<Coin, Date | string>>;
}
