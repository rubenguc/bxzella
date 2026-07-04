import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { getRequestHeaders } from "@tanstack/react-start/server";
import { auth } from "#/lib/auth";
import { wrapAction } from "#/lib/server-action";
import {
  accountSchema,
  accountUpdateSchema,
} from "#/features/exchange-accounts/validation";
import { encrypt, hashApiKey } from "#/lib/crypto";
import { getProvider } from "#/features/exchange-providers/get-provider";
import {
  createAccount as createAccountDb,
  deleteAccount as deleteAccountDb,
  getAccountByIdAndUserId,
  getAccountByProviderAndApiKey,
  updateAccount as updateAccountDb,
} from "#/features/exchange-accounts/db";

// ── Helpers ────────────────────────────────────────────

async function getUserId(): Promise<string> {
  const headers = getRequestHeaders();
  const session = await auth.api.getSession({ headers });
  if (!session?.user?.id) throw new Error("unauthorized");
  return session.user.id;
}

async function verifyOwnership(id: string, userId: string) {
  const account = await getAccountByIdAndUserId(id, userId);
  if (!account) throw new Error("unauthorized");
}

// ── Actions ────────────────────────────────────────────

export const createAccountAction = createServerFn({ method: "POST" })
  .validator((d: unknown) => d as z.infer<typeof accountSchema>)
  .handler(async ({ data }) => {
    return wrapAction(async () => {
      const parsed = accountSchema.safeParse(data);
      if (!parsed.success) throw new Error("invalid_account_data");

      const userId = await getUserId();
      const { name, apiKey, secretKey, provider } = parsed.data;

      const providerInstance = getProvider(provider, apiKey, secretKey);
      const isValid = await providerInstance.areApiKeysValid();
      if (!isValid) throw new Error("invalid_api_keys");

      const existing = await getAccountByProviderAndApiKey(
        hashApiKey(apiKey),
        provider,
      );
      if (existing) throw new Error("account_already_exists");

      await createAccountDb({
        name,
        userId,
        apiKey: encrypt(apiKey),
        secretKey: encrypt(secretKey),
        apiKeyHash: hashApiKey(apiKey),
        provider,
        lastSyncPerCoin: {},
        earliestTradeDatePerCoin: {},
      });

      // TODO: add initial syncPositions() call
      // await syncPositions(account.id)
    });
  });

export const updateAccountAction = createServerFn({ method: "POST" })
  .validator(
    (d: unknown) =>
      d as { id: string; data: z.infer<typeof accountUpdateSchema> },
  )
  .handler(async ({ data }) => {
    return wrapAction(async () => {
      const parsed = accountUpdateSchema.safeParse(data.data);
      if (!parsed.success) throw new Error("invalid_account_data");

      const userId = await getUserId();
      await verifyOwnership(data.id, userId);

      const { name } = parsed.data;
      await updateAccountDb(data.id, { name });
    });
  });

export const deleteAccountAction = createServerFn({ method: "POST" })
  .validator((d: unknown) => d as string)
  .handler(async ({ data: id }) => {
    return wrapAction(async () => {
      const userId = await getUserId();
      await verifyOwnership(id, userId);

      // TODO: deleteTradesByAccountId(id) when trades feature exists

      await deleteAccountDb(id);
    });
  });
