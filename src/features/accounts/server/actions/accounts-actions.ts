"use server";

import type { z } from "zod";
import connectDB from "@/db/db";
import { accountValidationSchema } from "@/features/accounts/schemas/accounts-schemas";
import {
  createAccountDb,
  deleteAccountDb,
  getAccountsByUserIdAndProvider,
  updateAccountDb,
} from "@/features/accounts/server/db/accounts-db";
import { decryptData, encryptData } from "@/features/accounts/utils/encryption";
import { getProvider } from "@/features/providers/utils/providers-utils";
import { syncPositions } from "@/features/trades/server/db/trades-db";
import type { Provider } from "@/interfaces/global-interfaces";
import { getUserAuth, handleServerActionError } from "@/utils/server-api-utils";
import type { AccountForm } from "../../interfaces/accounts-interfaces";
import { DEFAULT_COINS_PROVIDER } from "../../utils/accounts-utilsl";

async function processAccountData(
  unsafeData: z.infer<typeof accountValidationSchema>,
) {
  const { success, data: validatedData } =
    accountValidationSchema.safeParse(unsafeData);

  if (!success) return handleServerActionError("invalid_account_data");

  return { error: false, validatedData, message: "" };
}

export async function createAccountAction(unsafeData: AccountForm) {
  try {
    const userId = await getUserAuth();

    const processingResult = await processAccountData(unsafeData);
    if (processingResult.error)
      return { error: true, message: processingResult.message };

    const {
      validatedData: { apiKey, name, secretKey, provider },
    } = processingResult as {
      validatedData: AccountForm;
    };

    const providerService = getProvider(
      provider as Provider,
      apiKey,
      secretKey,
    );

    // Validation account by api keys
    const isValid = await providerService.areApiKeysValid("USDT");
    if (!isValid) return handleServerActionError("invalid_api_keys");

    const accountsByUserId = await getAccountsByUserIdAndProvider(
      userId,
      provider as Provider,
    );

    const isRepeated = accountsByUserId.some((account) => {
      const decriptedApiKey = decryptData(account.apiKey);
      const decriptedSecretKey = decryptData(account.secretKey);
      return decriptedApiKey === apiKey && decriptedSecretKey === secretKey;
    });

    if (isRepeated) return handleServerActionError("account_already_exists");

    await connectDB();
    const account = await createAccountDb({
      name,
      userId,
      apiKey: encryptData(apiKey),
      secretKey: encryptData(secretKey),
      provider: provider as Provider,
      lastSyncPerCoin: DEFAULT_COINS_PROVIDER[provider],
      earliestTradeDatePerCoin: {},
    });

    // TODO: this sync shouldn't be here ??
    await syncPositions(account._id);
  } catch (error) {
    return handleServerActionError("error_creating_account", error);
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

    const {
      validatedData: { name },
    } = processingResult as {
      validatedData: AccountForm;
    };

    await connectDB();
    await updateAccountDb(id, {
      name,
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
