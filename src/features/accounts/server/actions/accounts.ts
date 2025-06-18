"use server";

import { z } from "zod";
import { accountSchema } from "@/features/accounts/schemas/accounts";
import { auth } from "@clerk/nextjs/server";
import {
  createAccountDb,
  deleteAccountDb,
  updateAccountDb,
} from "../db/accounts";
import { getUserBalance } from "@/features/bingx/bingx-api";
import { encryptData } from "@/features/accounts/utils/encryption";
import { syncPositions } from "@/features/trades/server/db/trades";

async function processAccountData(unsafeData: z.infer<typeof accountSchema>) {
  const { userId } = await auth();

  if (userId === null) return { error: true, message: "not_authenticated" };

  const { success, data: validatedData } = accountSchema.safeParse(unsafeData);

  if (!success) return { error: true, message: "invalid_account_data" };

  const accountBalanceResponse = await getUserBalance(
    validatedData.apiKey,
    validatedData.secretKey,
  );

  const isValid = accountBalanceResponse.code === 0;
  if (!isValid) return { error: true, message: "invalid_api_keys" };

  const accountBalance = accountBalanceResponse.data[0];
  return { error: false, userId, validatedData, accountBalance };
}

export async function createAccount(unsafeData: z.infer<typeof accountSchema>) {
  const processingResult = await processAccountData(unsafeData);
  if (processingResult.error)
    return { error: true, message: processingResult.message };

  const { userId, validatedData, accountBalance } = processingResult;
  const account = await createAccountDb({
    ...validatedData,
    userId,
    uid: accountBalance!.shortUid,
    apiKey: encryptData(validatedData!.apiKey),
    secretKey: encryptData(validatedData!.secretKey),
  });

  // TODO: this sync shouldn't be here
  await syncPositions(account.uid);
}

export async function updateAccount(
  id: string,
  unsafeData: z.infer<typeof accountSchema>,
) {
  const processingResult = await processAccountData(unsafeData);
  if (processingResult.error)
    return { error: true, message: processingResult.message };

  const { userId, validatedData, accountBalance } = processingResult;
  await updateAccountDb(id, {
    ...validatedData,
    userId,
    uid: accountBalance!.shortUid,
    apiKey: encryptData(validatedData.apiKey),
    secretKey: encryptData(validatedData.secretKey),
  });
}

export async function deleteAccount(id: string) {
  await deleteAccountDb(id);
}
