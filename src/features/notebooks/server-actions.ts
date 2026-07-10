import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";

import { auth } from "#/lib/auth";
import { wrapAction } from "#/lib/server-action";
import { logger } from "#/lib/logger";
import { lexicalToPlainText } from "#/components/text-editor/helpers";
import { upsertNotebookByTradeId } from "#/features/notebooks/repository";
import { upsertNotebookSchema } from "#/features/notebooks/validation";
import { updateTemplateLastUsed } from "#/features/notebooks-templates/repository";

const log = logger.child({ name: "notebooks" });

// ── Helpers ────────────────────────────────────────────

async function getUserId(): Promise<string> {
  const headers = getRequestHeaders();
  const session = await auth.api.getSession({ headers });
  if (!session?.user?.id) throw new Error("unauthorized");
  return session.user.id;
}

// ── Actions ────────────────────────────────────────────

export const upsertNotebookAction = createServerFn({ method: "POST" })
  .validator((d: unknown) => d as { tradeId: string } & Record<string, unknown>)
  .handler(async ({ data }) => {
    return wrapAction(async () => {
      const parsed = upsertNotebookSchema.safeParse(data);
      if (!parsed.success) throw new Error("invalid_data");

      const userId = await getUserId();
      const { tradeId, notebookTemplateId } = data as {
        tradeId: string;
        notebookTemplateId?: string;
      };

      const result = await upsertNotebookByTradeId(tradeId, {
        content: parsed.data.content,
        contentPlainText: parsed.data.content
          ? lexicalToPlainText(parsed.data.content)
          : "",
        accountId: parsed.data.accountId,
        coin: parsed.data.coin,
      });

      // If a template was referenced, update its lastTimeUsed
      // (notebookTemplateId is NOT stored in the notebook record)
      if (notebookTemplateId) {
        updateTemplateLastUsed(notebookTemplateId, userId).catch((err) => {
          log.error({ err, notebookTemplateId }, "failed to update template lastTimeUsed");
        });
      }

      return result;
    });
  });
