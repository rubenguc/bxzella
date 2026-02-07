import mongoose, { Schema } from "mongoose";
import type { PlaybookTradeProgress } from "../interfaces/playbook-trade-progress-interfaces";

export const PlaybookTradeProgressSchema = new Schema<PlaybookTradeProgress>({
  tradeId: {
    type: Schema.Types.ObjectId,
    ref: "Trade",
    required: true,
  },
  playbookId: {
    type: Schema.Types.ObjectId,
    ref: "Playbook",
    required: true,
  },
  rulesProgress: [
    {
      groupName: {
        type: String,
        required: true,
      },
      rules: [
        {
          name: {
            type: String,
            required: true,
          },
          isCompleted: {
            type: Boolean,
            required: true,
          },
        },
      ],
    },
  ],
});

PlaybookTradeProgressSchema.index({ tradeId: 1 });
PlaybookTradeProgressSchema.index({ playbookId: 1 });
PlaybookTradeProgressSchema.index(
  { tradeId: 1, playbookId: 1 },
  { unique: true },
);

export const PlaybookTradeProgressModel =
  mongoose.models.PlaybookTradeProgress ||
  mongoose.model("PlaybookTradeProgress", PlaybookTradeProgressSchema);
