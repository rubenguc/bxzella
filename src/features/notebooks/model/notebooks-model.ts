import mongoose, { Schema } from "mongoose";
import type { Coin } from "@/interfaces/global-interfaces";
import type { Notebook } from "../interfaces/notebooks-interfaces";

export const NotebookSchema = new Schema<Notebook>(
  {
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
    },
    contentPlainText: {
      type: String,
    },
    startDate: {
      type: Date,
      required: true,
      default: null,
    },
    endDate: {
      type: Date,
      default: null,
    },
    tradeId: {
      type: mongoose.Types.ObjectId,
      ref: "Trade",
      default: null,
    },
    folderId: {
      type: mongoose.Types.ObjectId,
      ref: "NotebookFolder",
      required: true,
    },
    coin: {
      type: String,
      required: true,
      enum: ["VST", "USDT", "USDC"],
    },
  },
  {
    timestamps: true,
  },
);

export const NotebooksModel =
  mongoose.models.Notebook || mongoose.model("Notebook", NotebookSchema);
