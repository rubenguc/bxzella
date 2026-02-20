import { z } from "zod";

export const chatRequestSchema = z.object({
  accountId: z.string(),
  coin: z.enum(["USDT", "VST", "USDC"]),
  messages: z.array(z.any()),
});

export type ChatRequest = z.infer<typeof chatRequestSchema>;
