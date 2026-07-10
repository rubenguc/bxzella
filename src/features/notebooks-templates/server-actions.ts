import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { z } from "zod";

import { auth } from "#/lib/auth";
import { wrapAction } from "#/lib/server-action";
import { lexicalToPlainText } from "#/components/text-editor/helpers";
import {
  createNotebookTemplate as createRepo,
  updateNotebookTemplate as updateRepo,
  deleteNotebookTemplate as deleteRepo,
} from "#/features/notebooks-templates/repository";
import { notebookTemplateValidationSchema } from "#/features/notebooks-templates/validation";

// ── Helpers ────────────────────────────────────────────

async function getUserId(): Promise<string> {
  const headers = getRequestHeaders();
  const session = await auth.api.getSession({ headers });
  if (!session?.user?.id) throw new Error("unauthorized");
  return session.user.id;
}

// ── Actions ────────────────────────────────────────────

export const createNotebookTemplateAction = createServerFn({ method: "POST" })
  .validator((d: unknown) => d as z.infer<typeof notebookTemplateValidationSchema>)
  .handler(async ({ data }) => {
    return wrapAction(async () => {
      const parsed = notebookTemplateValidationSchema.safeParse(data);
      if (!parsed.success) throw new Error("invalid_data");

      const userId = await getUserId();
      return createRepo({
        title: parsed.data.title,
        content: parsed.data.content,
        contentPlainText: lexicalToPlainText(parsed.data.content),
        userId,
      });
    });
  });

export const updateNotebookTemplateAction = createServerFn({ method: "POST" })
  .validator(
    (d: unknown) =>
      d as { id: string; data: z.infer<typeof notebookTemplateValidationSchema> },
  )
  .handler(async ({ data }) => {
    return wrapAction(async () => {
      const parsed = notebookTemplateValidationSchema.safeParse(data.data);
      if (!parsed.success) throw new Error("invalid_data");

      const userId = await getUserId();
      const updated = await updateRepo(data.id, userId, {
        title: parsed.data.title,
        content: parsed.data.content,
        contentPlainText: lexicalToPlainText(parsed.data.content),
      });
      if (!updated) throw new Error("not_found");
      return updated;
    });
  });

export const deleteNotebookTemplateAction = createServerFn({ method: "POST" })
  .validator((d: unknown) => d as string)
  .handler(async ({ data: id }) => {
    return wrapAction(async () => {
      const userId = await getUserId();
      const deleted = await deleteRepo(id, userId);
      if (!deleted) throw new Error("not_found");
      return true;
    });
  });

