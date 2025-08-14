import { PlaybookModel } from "@/features/playbooks/model/playbook-model";
import {
  Playbook,
  PlaybookDocument,
  PlaybookTradeStatistics,
} from "@/features/playbooks/interfaces/playbook-interfaces";
import { TradeModel } from "@/features/trades/model/trades-model";

export async function createPlaybook(playbookData: Partial<Playbook>) {
  const playbook = new PlaybookModel(playbookData);
  return await playbook.save();
}

export async function getPlaybookById(id: string) {
  return await PlaybookModel.findById(id);
}

export async function getAllPlaybooks({
  userId,
  page = 1,
  limit = 10,
}: {
  userId: string;
  page?: number;
  limit?: number;
}) {
  const skip = (page - 1) * limit;
  const playbooks = await PlaybookModel.find({ userId })
    .skip(skip)
    .limit(limit)
    .sort({ _id: -1 });

  const total = await PlaybookModel.countDocuments();
  const totalPages = Math.ceil(total / limit);

  return {
    data: playbooks,
    pagination: {
      currentPage: page,
      totalPages,
      total,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
}

export async function updatePlaybook(
  id: string,
  updateData: Partial<Playbook>,
) {
  return await PlaybookModel.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });
}

export async function deletePlaybook(id: string) {
  return await PlaybookModel.findByIdAndDelete(id);
}

export async function getTradesStatisticByPlaybook({
  accountUID,
  startDate,
  endDate,
  coin = "USDT",
  page = 1,
  limit = 10,
}: {
  accountUID: string;
  startDate: Date;
  endDate: Date;
  coin?: "USDT" | "VST";
  page?: number;
  limit?: number;
  includeUnassigned?: boolean;
}) {
  const skip = page * limit;

  const [playbooks, totalPlaybooks] = await Promise.all([
    PlaybookModel.find({})
      .sort({ name: 1 })
      .skip(skip)
      .limit(limit)
      .lean() as Promise<Partial<PlaybookDocument>[]>,
    PlaybookModel.countDocuments({}),
  ]);

  const playbookIds = playbooks.map((pb) => pb._id);

  const tradesAgg = await TradeModel.aggregate([
    {
      $match: {
        accountUID,
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
    totalPlaybooks,
    totalPages: Math.ceil(totalPlaybooks / limit),
    currentPage: page,
    data,
  };
}
