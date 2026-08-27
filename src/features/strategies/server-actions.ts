import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { getRequestHeaders } from "@tanstack/react-start/server";
import { auth } from "#/lib/auth";
import { wrapAction } from "#/lib/server-action";
import {
  setTradeStrategySchema,
  strategyFormSchema,
} from "#/features/strategies/validation";
import {
  createStrategyWithPlaybook,
  deleteStrategy,
  getStrategyByIdAndUserId,
  setTradeStrategyAndChecks,
  updateStrategyWithPlaybook,
} from "#/features/strategies/repository";

// ── Helpers ────────────────────────────────────────────

async function getUserId(): Promise<string> {
  const headers = getRequestHeaders();
  const session = await auth.api.getSession({ headers });
  if (!session?.user?.id) throw new Error("unauthorized");
  return session.user.id;
}

// ── Actions ────────────────────────────────────────────

export const createStrategyAction = createServerFn({ method: "POST" })
  .validator((d: unknown) => d as z.infer<typeof strategyFormSchema>)
  .handler(async ({ data }) => {
    return wrapAction(async () => {
      const parsed = strategyFormSchema.safeParse(data);
      if (!parsed.success) throw new Error("invalid_strategy_data");

      const userId = await getUserId();
      return createStrategyWithPlaybook(userId, parsed.data);
    });
  });

export const updateStrategyAction = createServerFn({ method: "POST" })
  .validator(
    (d: unknown) =>
      d as { id: string; data: z.infer<typeof strategyFormSchema> },
  )
  .handler(async ({ data }) => {
    return wrapAction(async () => {
      const parsed = strategyFormSchema.safeParse(data.data);
      if (!parsed.success) throw new Error("invalid_strategy_data");

      const userId = await getUserId();
      const result = await updateStrategyWithPlaybook(
        data.id,
        userId,
        parsed.data,
      );
      if (!result) throw new Error("unauthorized");
      return result;
    });
  });

export const deleteStrategyAction = createServerFn({ method: "POST" })
  .validator((d: unknown) => d as string)
  .handler(async ({ data: id }) => {
    return wrapAction(async () => {
      const userId = await getUserId();
      const result = await deleteStrategy(id, userId);
      if (!result) throw new Error("unauthorized");
      return result;
    });
  });

export const setTradeStrategyAction = createServerFn({ method: "POST" })
  .validator((d: unknown) => d as z.infer<typeof setTradeStrategySchema>)
  .handler(async ({ data }) => {
    return wrapAction(async () => {
      const parsed = setTradeStrategySchema.safeParse(data);
      if (!parsed.success) throw new Error("invalid_assignment_data");

      const userId = await getUserId();
      const { tradeId, strategyId, checks } = parsed.data;

      if (strategyId) {
        const existingStrategy = await getStrategyByIdAndUserId(
          strategyId,
          userId,
        );
        if (!existingStrategy) throw new Error("unauthorized");
      }

      await setTradeStrategyAndChecks(tradeId, strategyId, checks);
    });
  });