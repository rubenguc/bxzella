import mongoose from "mongoose";
import type {
  PlaybookTradeProgress,
  PlaybookTradeProgressDocument,
  UpdatePlaybookTradeProgressProps,
} from "../interfaces/playbook-trade-progress-interfaces";
import { PlaybookTradeProgressModel } from "../model/playbook-trade-progress-model";

export async function upsertPlaybookTradeProgress({
  tradeId,
  playbookId,
  rulesProgress,
}: UpdatePlaybookTradeProgressProps): Promise<PlaybookTradeProgressDocument | null> {
  if (!playbookId) {
    // If no playbookId, remove the progress
    await PlaybookTradeProgressModel.deleteOne({ tradeId });
    return null;
  }

  const result = await PlaybookTradeProgressModel.findOneAndUpdate(
    { tradeId },
    {
      tradeId,
      playbookId,
      rulesProgress,
    },
    {
      upsert: true,
      new: true,
    },
  ).lean<PlaybookTradeProgressDocument>();

  return result;
}

export async function getPlaybookTradeProgressByTradeId(
  tradeId: string,
): Promise<PlaybookTradeProgressDocument | null> {
  return await PlaybookTradeProgressModel.findOne({
    tradeId,
  }).lean<PlaybookTradeProgressDocument>();
}

export async function getPlaybookTradeProgressByPlaybookId(
  playbookId: string,
): Promise<PlaybookTradeProgressDocument[]> {
  return await PlaybookTradeProgressModel.find({ playbookId }).lean<
    PlaybookTradeProgressDocument[]
  >();
}

export async function deletePlaybookTradeProgressByTradeId(
  tradeId: string,
): Promise<void> {
  await PlaybookTradeProgressModel.deleteOne({ tradeId });
}

export async function deletePlaybookTradeProgressByPlaybookId(
  playbookId: string,
): Promise<void> {
  await PlaybookTradeProgressModel.deleteMany({ playbookId });
}

export async function getPlaybookTradeProgressWithPlaybook(tradeId: string) {
  return await PlaybookTradeProgressModel.findOne({
    tradeId: new mongoose.Types.ObjectId(tradeId),
  })
    .populate("playbookId")
    .lean();
}
