import { z } from "zod";

export const folderSchema = z.object({
  name: z.string().min(1, "required"),
  tagColor: z
    .string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid color format"),
});

export type FolderSchemaForm = z.infer<typeof folderSchema>;
