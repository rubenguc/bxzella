import { z } from "zod";

export const accountValidationSchema = z.object({
  name: z.string().min(1, "name_required"),
  apiKey: z.string().min(1, "api_key_required"),
  secretKey: z.string().min(1, "secret_key_required"),
  provider: z.string().min(1, "provider_required"),
  // .refine(
  //   (value) => value === "bingx" || value === "bitunix",
  //   "provider_invalid",
  // ),
});

export const accountUpdateValidationSchema = z.object({
  name: z.string().min(1, "name_required"),
  apiKey: z.string(),
  secretKey: z.string(),
  provider: z.string(),
});
