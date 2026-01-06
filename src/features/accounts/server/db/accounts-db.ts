import type { ClientSession } from "mongoose";
import type {
  Account,
  AccountDocument,
  GetAccountsByUserId,
  GetAccountsByUserIdResponse,
} from "@/features/accounts/interfaces/accounts-interfaces";
import { AccountModel } from "@/features/accounts/model/accounts-model";
import type { Coin, Provider } from "@/interfaces/global-interfaces";
import { getPaginatedData } from "@/utils/db-utils";

export async function createAccountDb(data: Account): Promise<AccountDocument> {
  return await AccountModel.create(data);
}

export async function updateAccountDb(
  id: string,
  data: Partial<Account>,
): Promise<AccountDocument | null> {
  return await AccountModel.findByIdAndUpdate(id, data, { new: true });
}

export async function deleteAccountDb(
  id: string,
): Promise<AccountDocument | null> {
  return await AccountModel.findByIdAndDelete(id);
}

export async function getAccountById(
  id: string,
): Promise<AccountDocument | null> {
  return await AccountModel.findById(id);
}

export async function getAccountByIdWithCredentials(
  id: string,
): Promise<AccountDocument | null> {
  return await AccountModel.findById(id, {
    _id: 1,
    name: 1,
    uid: 1,
    apiKey: 1,
    secretKey: 1,
  });
}

export async function getAccountsByUserId({
  limit,
  page,
  userId,
}: GetAccountsByUserId): GetAccountsByUserIdResponse {
  return await getPaginatedData(
    AccountModel,
    { userId },
    {
      projection: {
        _id: 1,
        name: 1,
        provider: 1,
        earliestTradeDatePerCoin: 1,
        lastSyncPerCoin: 1,
      },
      sortBy: { createdAt: -1 },
      limit,
      page,
    },
  );
}

export async function getAccountsByUserIdAndProvider(
  userId: string,
  provider: Provider,
): Promise<AccountDocument[]> {
  return await AccountModel.find({ userId, provider });
}

export async function getAccountLastSyncPerCoin(
  uid: string,
  coin: Coin,
): Promise<number> {
  const account = await AccountModel.findOne({ uid }).lean<AccountDocument>();

  return account?.lastSyncPerCoin?.[coin] || 0;
}

export async function updateLastSyncPerCoin(
  id: string,
  coin: Coin,
  time: number,
  session?: ClientSession,
) {
  await AccountModel.updateOne(
    { _id: id },
    { $set: { [`lastSyncPerCoin.${coin}`]: time } },
    { session },
  );
}

export async function updateEarliestTradeDatePerCoin(
  id: string,
  coin: Coin,
  date: Date,
) {
  return await AccountModel.findOneAndUpdate(
    { _id: id },
    { $set: { [`earliestTradeDatePerCoin.${coin}`]: date } },
    {
      new: true,
      upsert: true,
    },
  );
}
