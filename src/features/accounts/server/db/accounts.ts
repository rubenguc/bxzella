import {
  AccountModel,
  IAccountModel,
} from "@/features/accounts/model/accounts";

export async function createAccountDb(data: IAccountModel) {
  return await AccountModel.create(data);
}

export async function updateAccountDb(id: string, data: IAccountModel) {
  return await AccountModel.findByIdAndUpdate(id, data, { new: true });
}

export async function deleteAccountDb(id: string) {
  return await AccountModel.findByIdAndDelete(id);
}

export async function getAccountsByUserId(
  userId: string,
  page: number,
  limit: number,
) {
  const skip = page * limit;
  const totalAccounts = await AccountModel.countDocuments({ userId });
  const pageCount = Math.ceil(totalAccounts / limit);

  const accounts = await AccountModel.find(
    { userId },
    { _id: 1, name: 1, uid: 1 },
  )
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  return {
    accounts,
    pageCount,
    totalAccounts,
  };
}
