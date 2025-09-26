"use server";

import { z } from "zod";
import { accountValidationSchema } from "@/features/accounts/schemas/accounts-schemas";
import {
  createAccountDb,
  deleteAccountDb,
  updateAccountDb,
} from "@/features/accounts/server/db/accounts-db";
import { getUserBalance } from "@/features/bingx/bingx-api";
import { encryptData } from "@/features/accounts/utils/encryption";
import { syncPositions } from "@/features/trades/server/db/trades-db";
import { getUserAuth, handleServerActionError } from "@/utils/server-api-utils";
import connectDB from "@/db/db";

async function processAccountData(
  unsafeData: z.infer<typeof accountValidationSchema>,
) {
  const userId = await getUserAuth();

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

export async function createAccountAction(
  unsafeData: z.infer<typeof accountValidationSchema>,
) {
  try {
    const processingResult = await processAccountData(unsafeData);
    if (processingResult.error)
      return { error: true, message: processingResult.message };

    const { userId, validatedData, shortUid } = processingResult as {
      userId: string;
      validatedData: z.infer<typeof accountValidationSchema>;
      shortUid: string;
    };
    await connectDB();
    const account = await createAccountDb({
      ...validatedData,
      userId,
      uid: shortUid,
      apiKey: encryptData(validatedData!.apiKey),
      secretKey: encryptData(validatedData!.secretKey),
    });

    // TODO: this sync shouldn't be here ??
    await syncPositions(account.uid);
  } catch (error) {
    return handleServerActionError("error_updating_account", error);
  }
}

export async function updateAccountAction(
  id: string,
  unsafeData: z.infer<typeof accountValidationSchema>,
) {
  try {
    const processingResult = await processAccountData(unsafeData);
    if (processingResult.error)
      return { error: true, message: processingResult.message };

    const { userId, validatedData, shortUid } = processingResult as {
      userId: string;
      validatedData: z.infer<typeof accountValidationSchema>;
      shortUid: string;
    };

    await connectDB();
    await updateAccountDb(id, {
      ...validatedData,
      userId,
      uid: shortUid,
      apiKey: encryptData(validatedData.apiKey),
      secretKey: encryptData(validatedData.secretKey),
    });
  } catch (error) {
    return handleServerActionError("error_updating_account", error);
  }
}

export async function deleteAccountAction(id: string) {
  try {
    await connectDB();
    await deleteAccountDb(id);
  } catch (error) {
    return handleServerActionError("error_deleting_account", error);
  }
}
