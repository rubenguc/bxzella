import mongoose, { Schema } from "mongoose";

export interface ITradeModel {
  accountUID: string;
  positionId: string;
  symbol: string;
  positionSide: string;
  isolated: boolean;
  openTime: number;
  updateTime: number;
  avgPrice: string;
  avgClosePrice: string;
  realisedProfit: string;
  netProfit: string;
  positionAmt: string;
  closePositionAmt: string;
  leverage: number;
  closeAllPositions: boolean;
  positionCommission: string;
  totalFunding: string;
  type: "P" | "S";
}

/*
 * P - Perpetual contracts
 * S - Standard contracts
 */

export const TradeSchema = new Schema<ITradeModel>({
  accountUID: {
    type: String,
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
    type: Number,
    required: true,
  },
  updateTime: {
    type: Number,
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
});

TradeSchema.index({ accountUID: 1 });
TradeSchema.index({ accountUID: 1, openTime: 1 });
TradeSchema.index({ accountUID: 1, openTime: -1 });
TradeSchema.index({ accountUID: 1, updateTime: 1 });
TradeSchema.index({ accountUID: 1, updateTime: -1 });
TradeSchema.index({ accountUID: 1, symbol: 1, openTime: 1 });
TradeSchema.index({ accountUID: 1, symbol: 1, openTime: -1 });
TradeSchema.index({ accountUID: 1, symbol: 1, openTime: 1, updateTime: 1 });
TradeSchema.index({ accountUID: 1, symbol: 1, openTime: 1, updateTime: -1 });

export const TradeModel =
  mongoose.models.Trade || mongoose.model("Trade", TradeSchema);
