import { z } from "zod";

export const accountSchema = z.object({
  name: z.string().min(1, "name_required"),
  apiKey: z.string().min(1, "api_key_required"),
  secretKey: z.string().min(1, "secret_key_required"),
});
