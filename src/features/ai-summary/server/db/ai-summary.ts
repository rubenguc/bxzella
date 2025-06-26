import { AISummaryModel } from "@/features/ai-summary/model/ai-summary";
import { AISummary } from "@/features/ai-summary/interfaces/ai-summary-interfaces";

export async function createAISummaryDb(data: AISummary) {
  return await AISummaryModel.create(data);
}

export async function getAISummaryByUID(
  uid: string,
  page: number,
  limit: number,
) {
  const skip = (page - 1) * limit;
  const total = await AISummaryModel.countDocuments({ uid });
  const totalPages = Math.ceil(total / limit);

  const data = await AISummaryModel.find(
    { uid },
    {
      _id: 1,
      startDate: 1,
      endDate: 1,
      result: 1,
      model: 1,
    },
  )
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  return {
    data,
    totalPages,
  };
}

export async function getAISummaryWeek(
  uid: string,
  startDate: Date,
  endDate: Date,
) {
  return await AISummaryModel.findOne({
    uid,
    startDate: { $gte: startDate },
    endDate: { $lte: endDate },
  }).lean();
}
