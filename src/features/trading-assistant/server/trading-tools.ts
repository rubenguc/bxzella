import mongoose from "mongoose";
import { NotebooksModel } from "@/features/notebooks/model/notebooks-model";
import { getTradesByAccountId } from "@/features/trades/server/db/trades-db";
import type { Coin } from "@/interfaces/global-interfaces";

interface GetTradesParams {
  accountId: string;
  coin: Coin;
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  timezone?: number;
}

interface GetNotebooksParams {
  accountId: string;
  coin: Coin;
  tradeId?: string;
  folderId?: string;
  page?: number;
  limit?: number;
}

interface AnalyzeTradePnLParams {
  accountId: string;
  coin: Coin;
  startDate?: string;
  endDate?: string;
  limit?: number;
  page?: number;
  timezone?: number;
}

export async function getTrades({
  accountId,
  coin,
  page = 1,
  limit = 20,
  startDate,
  endDate,
  timezone = 0,
}: GetTradesParams) {
  const result = await getTradesByAccountId(
    {
      accountId,
      coin,
      page,
      limit,
      startDate,
      endDate,
    },
    timezone,
  );

  return result.data.map((trade) => ({
    positionId: trade.positionId,
    symbol: trade.symbol,
    positionSide: trade.positionSide,
    leverage: trade.leverage,
    netProfit: trade.netProfit,
    realisedProfit: trade.realisedProfit,
    openTime: trade.openTime,
    closeAllPositions: trade.closeAllPositions,
    avgPrice: trade.avgPrice,
    avgClosePrice: trade.avgClosePrice,
    positionAmt: trade.positionAmt,
    closePositionAmt: trade.closePositionAmt,
    coin: trade.coin,
  }));
}

export async function getNotebooks({
  accountId: _accountId,
  coin,
  tradeId,
  folderId,
  page = 1,
  limit = 20,
}: GetNotebooksParams) {
  const find: Record<string, mongoose.Types.ObjectId | string> = {
    coin,
  };

  if (tradeId) {
    find.tradeId = new mongoose.Types.ObjectId(tradeId);
  }

  if (folderId) {
    find.folderId = new mongoose.Types.ObjectId(folderId);
  }

  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    NotebooksModel.find(find).sort({ _id: -1 }).skip(skip).limit(limit).lean(),
    NotebooksModel.countDocuments(find),
  ]);

  return {
    data: data.map((notebook) => ({
      _id: notebook._id,
      title: notebook.title,
      contentPlainText:
        ((notebook as Record<string, unknown>).contentPlainText as string) ||
        "",
      tradeId: notebook.tradeId,
      folderId: notebook.folderId,
      coin: notebook.coin,
      startDate: notebook.startDate,
      endDate: notebook.endDate,
      createdAt: notebook.createdAt,
      updatedAt: notebook.updatedAt,
    })),
    totalPages: Math.ceil(total / limit),
    total,
  };
}

export async function analyzeTradePnL({
  accountId,
  coin,
  startDate,
  endDate,
  limit = 50,
  page = 1,
  timezone = 0,
}: AnalyzeTradePnLParams) {
  const result = await getTradesByAccountId(
    {
      accountId,
      coin,
      page,
      limit,
      startDate,
      endDate,
    },
    timezone,
  );

  const closedTrades = result.data.filter((t) => t.closeAllPositions);
  const tradeIds = closedTrades.map((t) => t._id);

  if (tradeIds.length === 0) {
    return [];
  }

  const notebooks = await NotebooksModel.find({
    tradeId: { $in: tradeIds },
    coin,
  }).lean();

  const notebookMap = new Map(notebooks.map((n) => [n.tradeId?.toString(), n]));

  return closedTrades.map((trade) => {
    const notebook = notebookMap.get(trade._id?.toString());
    return {
      positionId: trade.positionId,
      symbol: trade.symbol,
      positionSide: trade.positionSide,
      leverage: trade.leverage,
      netProfit: trade.netProfit,
      realisedProfit: trade.realisedProfit,
      openTime: trade.openTime,
      updateTime: trade.updateTime,
      closeAllPositions: trade.closeAllPositions,
      avgPrice: trade.avgPrice,
      avgClosePrice: trade.avgClosePrice,
      positionAmt: trade.positionAmt,
      closePositionAmt: trade.closePositionAmt,
      positionCommission: trade.positionCommission,
      totalFunding: trade.totalFunding,
      coin: trade.coin,
      notebook: notebook
        ? {
            title: notebook.title,
            contentPlainText:
              ((notebook as Record<string, unknown>)
                .contentPlainText as string) || "",
            startDate: notebook.startDate,
            endDate: notebook.endDate,
          }
        : null,
    };
  });
}
