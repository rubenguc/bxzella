"use server";

import { z } from "zod";
import { accountValidationSchema } from "@/features/accounts/schemas/accounts-schemas";
import { auth } from "@clerk/nextjs/server";
import {
  createAccountDb,
  deleteAccountDb,
  updateAccountDb,
} from "@/features/accounts/server/db/accounts-db";
import { getUserBalance } from "@/features/bingx/bingx-api";
import { encryptData } from "@/features/accounts/utils/encryption";
import { syncPositions } from "@/features/trades/server/db/trades-db";
import { handleServerActionError } from "@/utils/server-api-utils";

async function processAccountData(
  unsafeData: z.infer<typeof accountValidationSchema>,
) {
  const { userId } = await auth();

  if (userId === null) return handleServerActionError("not_authenticated");

  const { success, data: validatedData } =
    accountValidationSchema.safeParse(unsafeData);

  if (!success) return handleServerActionError("invalid_account_data");

  const accountBalanceResponse = await getUserBalance(
    validatedData.apiKey,
    validatedData.secretKey,
  );

  const isValid = accountBalanceResponse.code === 0;
  if (!isValid) return handleServerActionError("invalid_api_keys");

  const shortUid = accountBalanceResponse.data[0].shortUid;
  return { error: false, userId, validatedData, shortUid, message: "" };
}

export async function createAccount(
  unsafeData: z.infer<typeof accountValidationSchema>,
) {
  const processingResult = await processAccountData(unsafeData);
  if (processingResult.error)
    return { error: true, message: processingResult.message };

  const { userId, validatedData, shortUid } = processingResult as {
    userId: string;
    validatedData: z.infer<typeof accountValidationSchema>;
    shortUid: string;
  };
  const account = await createAccountDb({
    ...validatedData,
    userId,
    uid: shortUid,
    apiKey: encryptData(validatedData!.apiKey),
    secretKey: encryptData(validatedData!.secretKey),
  });

  // TODO: this sync shouldn't be here
  await syncPositions(account.uid);
}

export async function updateAccount(
  id: string,
  unsafeData: z.infer<typeof accountValidationSchema>,
) {
  const processingResult = await processAccountData(unsafeData);
  if (processingResult.error)
    return { error: true, message: processingResult.message };

  const { userId, validatedData, shortUid } = processingResult as {
    userId: string;
    validatedData: z.infer<typeof accountValidationSchema>;
    shortUid: string;
  };
  await updateAccountDb(id, {
    ...validatedData,
    userId,
    uid: shortUid,
    apiKey: encryptData(validatedData.apiKey),
    secretKey: encryptData(validatedData.secretKey),
  });
}

export async function deleteAccount(id: string) {
  try {
    await deleteAccountDb(id);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_err) {
    return handleServerActionError();
  }
}
