import mongoose, { Schema, Types } from "mongoose";
import type { DayLog } from "../interfaces/day-log-interfaces";

export const DayLogSchema = new Schema<DayLog>(
  {
    date: {
      type: String,
      required: true,
      match: /^\d{4}-\d{2}-\d{2}$/,
    },
    trades: [{ type: Schema.Types.ObjectId, ref: "Trade" }],
    accountId: {
      type: Types.ObjectId,
      ref: "Account",
      required: true,
    },
    coin: {
      type: String,
      required: true,
      enum: ["VST", "USDT", "USDC"],
    },
    netPnL: {
      type: Number,
      required: true,
    },
    totalTrades: {
      type: Number,
      required: true,
    },
    winRate: {
      type: Number,
      required: true,
    },
    winners: {
      type: Number,
      required: true,
    },
    lossers: {
      type: Number,
      required: true,
    },
    commissions: {
      type: Number,
      required: true,
    },
    profitFactor: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

DayLogSchema.index({ accountId: 1 });
DayLogSchema.index({ accountId: 1, date: 1, coin: 1 });
DayLogSchema.index({ accountId: 1, date: -1, coin: 1 });
DayLogSchema.index({ coin: 1 });
DayLogSchema.index({ date: 1 });
DayLogSchema.index({ accountId: 1, coin: 1 });

export const DayLogModel =
  mongoose.models.DayLog || mongoose.model("DayLog", DayLogSchema);
