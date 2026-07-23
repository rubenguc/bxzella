import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getRequestHeaders } from "@tanstack/react-start/server";

import { auth } from "#/lib/auth";
import { wrapAction } from "#/lib/server-action";
import { createSubscriptionSchema } from "#/features/ai-summary-subscriptions/validation";
import {
  createSubscription as createSubscriptionDb,
  deleteSubscription as deleteSubscriptionDb,
  getSubscriptionByIdAndUserId,
  getSubscriptionByAccountAndCoin,
  toggleSubscriptionActive as toggleSubscriptionActiveDb,
} from "#/features/ai-summary-subscriptions/repository";

// ── Helpers ────────────────────────────────────────────

async function getUserId(): Promise<string> {
  const headers = getRequestHeaders();
  const session = await auth.api.getSession({ headers });
  if (!session?.user?.id) throw new Error("unauthorized");
  return session.user.id;
}

async function verifyOwnership(id: string, userId: string) {
  const sub = await getSubscriptionByIdAndUserId(id, userId);
  if (!sub) throw new Error("unauthorized");
}

// ── Actions ────────────────────────────────────────────

export const createSubscriptionAction = createServerFn({ method: "POST" })
  .validator((d: unknown) => d as z.infer<typeof createSubscriptionSchema>)
  .handler(async ({ data }) => {
    return wrapAction(async () => {
      const parsed = createSubscriptionSchema.safeParse(data);
      if (!parsed.success) throw new Error("invalid_subscription_data");

      const userId = await getUserId();
      const { accountId, coin, includeNotebook } = parsed.data;

      // Check for duplicate account + coin
      const existing = await getSubscriptionByAccountAndCoin(accountId, coin);
      if (existing) throw new Error("subscription_already_exists");

      await createSubscriptionDb({
        userId,
        accountId,
        coin,
        isActive: true,
        includeNotebook,
      });
    });
  });

export const toggleSubscriptionAction = createServerFn({ method: "POST" })
  .validator(
    (d: unknown) => d as { id: string; isActive: boolean },
  )
  .handler(async ({ data }) => {
    return wrapAction(async () => {
      const userId = await getUserId();
      await verifyOwnership(data.id, userId);

      await toggleSubscriptionActiveDb(data.id, data.isActive);
    });
  });

export const deleteSubscriptionAction = createServerFn({ method: "POST" })
  .validator((d: unknown) => d as string)
  .handler(async ({ data: id }) => {
    return wrapAction(async () => {
      const userId = await getUserId();
      await verifyOwnership(id, userId);

      await deleteSubscriptionDb(id);
    });
  });
