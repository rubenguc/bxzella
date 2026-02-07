import mongoose, { Schema } from "mongoose";
import type { Trade } from "@/features/trades/interfaces/trades-interfaces";

export const TradeSchema = new Schema<Trade>({
  accountId: {
    type: mongoose.Types.ObjectId,
    ref: "Account",
    required: true,
  },
  positionId: {
    type: String,
    required: true,
    unique: true,
  },
  symbol: {
    type: String,
    required: true,
  },
  positionSide: {
    type: String,
    required: true,
  },
  isolated: {
    type: Boolean,
    required: true,
  },
  openTime: {
    type: Date,
    required: true,
  },
  updateTime: {
    type: Date,
    required: true,
  },
  avgPrice: {
    type: String,
    required: true,
  },
  avgClosePrice: {
    type: String,
    required: true,
  },
  realisedProfit: {
    type: String,
    required: true,
  },
  netProfit: {
    type: String,
    required: true,
  },
  positionAmt: {
    type: String,
    required: true,
  },
  closePositionAmt: {
    type: String,
    required: true,
  },
  leverage: {
    type: Number,
    required: true,
  },
  closeAllPositions: {
    type: Boolean,
    required: true,
  },
  positionCommission: {
    type: String,
    required: true,
  },
  totalFunding: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: ["P", "S"],
  },
  coin: {
    type: String,
    required: true,
    enum: ["VST", "USDT"],
  },
});

TradeSchema.index({ positionId: 1, accountId: 1 });
TradeSchema.index({ accountId: 1 });
TradeSchema.index({ accountId: 1, openTime: 1, coin: 1 });
TradeSchema.index({ accountId: 1, openTime: -1, coin: 1 });
TradeSchema.index({ accountId: 1, updateTime: 1, coin: 1 });
TradeSchema.index({ accountId: 1, updateTime: -1, coin: 1 });
TradeSchema.index({ accountId: 1, symbol: 1, openTime: 1, coin: 1 });
TradeSchema.index({ accountId: 1, symbol: 1, openTime: -1, coin: 1 });
TradeSchema.index({
  accountId: 1,
  symbol: 1,
  openTime: 1,
  updateTime: 1,
  coin: 1,
});
TradeSchema.index({
  accountId: 1,
  symbol: 1,
  openTime: 1,
  updateTime: -1,
  coin: 1,
});

export const TradeModel =
  mongoose.models.Trade || mongoose.model("Trade", TradeSchema);
