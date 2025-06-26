import mongoose, { Schema } from "mongoose";
import { AISummary } from "@/features/ai-summary/interfaces/ai-summary-interfaces";

export const AISummarySchema = new Schema<AISummary>({
  uid: { type: String, required: true, index: true },
  statistics: { type: Object, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  result: { type: String, required: true },
  coin: { type: String, required: true, enum: ["VST", "USDT"] },
  model: { type: String, required: true },
});

AISummarySchema.set("timestamps", true);

AISummarySchema.index({ uid: 1, startDate: 1, endDate: 1 });
AISummarySchema.index({ uid: 1, startDate: -1, endDate: -1 });

export const AISummaryModel =
  mongoose.models.AISummary || mongoose.model("AISummary", AISummarySchema);
