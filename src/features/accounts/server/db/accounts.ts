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

export async function getAccountByUID(uid: string) {
  return await AccountModel.findOne({ uid });
}

export async function getAccountById(id: string) {
  return await AccountModel.findById(id, {
    _id: 1,
    name: 1,
    uid: 1,
  });
}

export async function getAccountByIdWithCredentials(id: string) {
  return await AccountModel.findById(id, {
    _id: 1,
    name: 1,
    uid: 1,
    apiKey: 1,
    secretKey: 1,
  });
}

export async function getAccountsByUserId(
  userId: string,
  page: number,
  limit: number,
) {
  const skip = page * limit;
  const total = await AccountModel.countDocuments({ userId });
  const totalPages = Math.ceil(total / limit);

  const data = await AccountModel.find({ userId }, { _id: 1, name: 1, uid: 1 })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  return {
    data,
    totalPages,
  };
}
