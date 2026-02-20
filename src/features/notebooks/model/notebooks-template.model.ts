import mongoose, { Schema } from "mongoose";
import type { NotebookTemplate } from "@/features/notebooks/interfaces/notebooks-template-interfaces";

export const NotebookTemplateSchema = new Schema<NotebookTemplate>(
  {
    userId: { type: String, required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    contentPlainText: { type: String, default: "" },
  },
  {
    timestamps: true,
  },
);

export const NotebookTemplateModel =
  mongoose.models.NotebookTemplate ||
  mongoose.model("NotebookTemplate", NotebookTemplateSchema);
