import mongoose, { Schema } from "mongoose";
import type { NotebookFolder } from "../interfaces/notebooks-folder-interfaces";

export const NotebookFolderSchema = new Schema<NotebookFolder>(
  {
    name: {
      type: String,
      required: true,
    },
    tagColor: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["trade", "day", "session", "note"],
      default: "session",
    },
    isDefault: {
      type: Boolean,
      required: true,
      default: false,
    },
    accountId: {
      type: mongoose.Types.ObjectId,
      ref: "Account",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

NotebookFolderSchema.index({ accountId: 1, isDefault: 1 });

export const NotebookFolderModel =
  mongoose.models.NotebookFolder ||
  mongoose.model("NotebookFolder", NotebookFolderSchema);
