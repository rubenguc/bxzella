import mongoose from "mongoose";
import type {
  GetAllPlaybooksProps,
  GetAllPlaybooksPropsResponse,
  GetTradesStatisticByPlaybookIdProps,
  GetTradesStatisticByPlaybookIdResponse,
  GetTradesStatisticByPlaybookProps,
  GetTradesStatisticByPlaybookResponse,
  Playbook,
  PlaybookDocument,
  PlaybookTradeStatistics,
} from "@/features/playbooks/interfaces/playbooks-interfaces";
import { PlaybookModel } from "@/features/playbooks/model/playbooks-model";
import { TradeModel } from "@/features/trades/model/trades-model";
import { getUTCDay } from "@/utils/date-utils";
import { getPaginatedData } from "@/utils/db-utils";

export async function createPlaybook(
  playbookData: Partial<Playbook>,
): Promise<PlaybookDocument> {
  const playbook = new PlaybookModel(playbookData);
  return await playbook.save();
}

export async function getPlaybookById(
  id: string,
): Promise<PlaybookDocument | null> {
  return await PlaybookModel.findById(id).lean<PlaybookDocument>();
}

export async function getAllPlaybooks({
  accountId,
  page = 1,
  limit = 10,
}: GetAllPlaybooksProps): GetAllPlaybooksPropsResponse {
  return await getPaginatedData(
    PlaybookModel,
    { accountId },
    {
      page,
      limit,
    },
  );
}

export async function updatePlaybook(
  id: string,
  updateData: Partial<Playbook>,
): Promise<PlaybookDocument | null> {
  return await PlaybookModel.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });
}

export async function deletePlaybook(
  id: string,
): Promise<PlaybookDocument | null> {
  return await PlaybookModel.findByIdAndDelete(id);
}

export async function getTradesStatisticByPlaybook({
  accountId,
  startDate,
  endDate,
  coin = "USDT",
  page = 1,
  limit = 10,
}: GetTradesStatisticByPlaybookProps): GetTradesStatisticByPlaybookResponse {
  const { data: playbooks, totalPages } = await getPaginatedData(
    PlaybookModel,
    {
      accountId,
    },
    {
      page,
      limit,
    },
  );

  const playbookIds = playbooks.map((pb) => pb._id);

  const tradesAgg = await TradeModel.aggregate([
    {
      $match: {
        accountId,
        coin,
        closeAllPositions: true,
        openTime: { $gte: startDate, $lte: endDate },
        updateTime: { $gte: startDate, $lte: endDate },
        "playbook.id": { $in: playbookIds },
      },
    },
    {
      $addFields: {
        numericNetProfit: {
          $convert: { input: "$netProfit", to: "double", onError: 0 },
        },
      },
    },
    {
      $group: {
        _id: "$playbook.id",
        totalTrades: { $sum: 1 },
        totalWin: {
          $sum: { $cond: [{ $gt: ["$numericNetProfit", 0] }, 1, 0] },
        },
        totalLoss: {
          $sum: { $cond: [{ $lt: ["$numericNetProfit", 0] }, 1, 0] },
        },
        sumWin: {
          $sum: {
            $cond: [{ $gt: ["$numericNetProfit", 0] }, "$numericNetProfit", 0],
          },
        },
        sumLoss: {
          $sum: {
            $cond: [{ $lt: ["$numericNetProfit", 0] }, "$numericNetProfit", 0],
          },
        },
        netPnL: { $sum: "$numericNetProfit" },
      },
    },
  ]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tradeMap = new Map<string, any>();
  for (const t of tradesAgg) {
    tradeMap.set(t._id?.toString() ?? "null", t);
  }

  const data: PlaybookTradeStatistics[] = playbooks.map((pb) => {
    const s = tradeMap.get(pb._id!.toString()) ?? {
      totalTrades: 0,
      totalWin: 0,
      totalLoss: 0,
      sumWin: 0,
      sumLoss: 0,
      netPnL: 0,
    };

    const sumLossAbs = Math.abs(s.sumLoss);
    const profitFactor = sumLossAbs === 0 ? s.sumWin : s.sumWin / sumLossAbs;
    const tradeWinPercent =
      s.totalTrades === 0 ? 0 : (s.totalWin / s.totalTrades) * 100;
    const avgWin = s.totalWin === 0 ? 0 : s.sumWin / s.totalWin;
    const avgLoss = s.totalLoss === 0 ? 0 : Math.abs(s.sumLoss) / s.totalLoss;
    const avgWinLoss = s.totalWin && s.totalLoss ? avgWin / avgLoss : 0;

    return {
      playbook: {
        _id: pb._id,
        rulesGroup: pb.rulesGroup,
        name: pb.name,
        description: pb.description,
        icon: pb.icon,
        notes: pb.notes,
      },
      tradeWin: {
        value: tradeWinPercent,
        totalWin: s.totalWin,
        totalLoss: s.totalLoss,
      },
      avgWinLoss: {
        value: avgWinLoss,
        avgWin,
        avgLoss,
      },
      netPnL: {
        value: s.netPnL,
        totalTrades: s.totalTrades,
      },
      profitFactor: {
        value: profitFactor,
        sumWin: s.sumWin,
        sumLoss: s.sumLoss,
      },
    };
  });

  return {
    totalPages,
    data,
  };
}

export async function getTradesStatisticByPlaybookId({
  playbookId,
  accountId,
  startDate,
  endDate,
  coin = "USDT",
}: GetTradesStatisticByPlaybookIdProps): GetTradesStatisticByPlaybookIdResponse {
  const playbook = await PlaybookModel.findById(playbookId).lean();

  if (!playbook) {
    throw new Error(`Playbook with id ${playbookId} not found.`);
  }

  const parsedStartDate = getUTCDay(startDate);
  const parsedEndDate = getUTCDay(endDate, true);

  const tradesAgg = await TradeModel.aggregate([
    {
      $match: {
        accountId,
        coin,
        closeAllPositions: true,
        openTime: { $gte: parsedStartDate, $lte: parsedEndDate },
        updateTime: { $gte: parsedStartDate, $lte: parsedEndDate },
        "playbook.id": new mongoose.Types.ObjectId(playbookId),
      },
    },
    {
      $addFields: {
        numericNetProfit: {
          $convert: { input: "$netProfit", to: "double", onError: 0 },
        },
      },
    },
    {
      $group: {
        _id: "$playbook.id",
        totalTrades: { $sum: 1 },
        totalWin: {
          $sum: { $cond: [{ $gt: ["$numericNetProfit", 0] }, 1, 0] },
        },
        totalLoss: {
          $sum: { $cond: [{ $lt: ["$numericNetProfit", 0] }, 1, 0] },
        },
        sumWin: {
          $sum: {
            $cond: [{ $gt: ["$numericNetProfit", 0] }, "$numericNetProfit", 0],
          },
        },
        sumLoss: {
          $sum: {
            $cond: [{ $lt: ["$numericNetProfit", 0] }, "$numericNetProfit", 0],
          },
        },
        netPnL: { $sum: "$numericNetProfit" },
      },
    },
  ]);

  const statistics = tradesAgg[0] ?? {
    totalTrades: 0,
    totalWin: 0,
    totalLoss: 0,
    sumWin: 0,
    sumLoss: 0,
    netPnL: 0,
  };

  const sumLossAbs = Math.abs(statistics.sumLoss);
  const profitFactor =
    sumLossAbs === 0 ? statistics.sumWin : statistics.sumWin / sumLossAbs;
  const tradeWinPercent =
    statistics.totalTrades === 0
      ? 0
      : (statistics.totalWin / statistics.totalTrades) * 100;
  const avgWin =
    statistics.totalWin === 0 ? 0 : statistics.sumWin / statistics.totalWin;
  const avgLoss =
    statistics.totalLoss === 0
      ? 0
      : Math.abs(statistics.sumLoss) / statistics.totalLoss;
  const avgWinLoss =
    statistics.totalWin && statistics.totalLoss ? avgWin / avgLoss : 0;

  const data: PlaybookTradeStatistics = {
    playbook: playbook as Partial<PlaybookDocument>,
    tradeWin: {
      value: tradeWinPercent,
      totalWin: statistics.totalWin,
      totalLoss: statistics.totalLoss,
    },
    avgWinLoss: {
      value: avgWinLoss,
      avgWin,
      avgLoss,
    },
    netPnL: {
      value: statistics.netPnL,
      totalTrades: statistics.totalTrades,
    },
    profitFactor: {
      value: profitFactor,
      sumWin: statistics.sumWin,
      sumLoss: statistics.sumLoss,
    },
  };

  return {
    data,
  };
}
