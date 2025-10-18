import { z } from "zod";

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

export const dateParamValidation = ({ field }: { field: string }) => {
  return z.string().refine((val) => dateRegex.test(val), {
    message: `${field} must be in format YYYY-MM-DD`,
  });
};

export const dateParamValidationOptional = ({ field }: { field: string }) => {
  return z
    .string()
    .optional()
    .refine((val) => !val || dateRegex.test(val), {
      message: `${field} must be in format YYYY-MM-DD`,
    });
};

export const accountIdParamValidation = () => {
  return z.string().min(1, "accountId is required");
};

export const pageParamValidation = () => {
  return z
    .string()
    .optional()
    .transform((val) => (val && Number(val) >= 0 ? parseInt(val, 10) : 1))
    .refine((val) => !isNaN(val) && val >= 0, {
      message: "page must be a greater than or equal to zero",
    });
};

export const limitParamValidation = () => {
  return z
    .string()
    .optional()
    .transform((val) => (val && Number(val) ? parseInt(val, 10) : 10))
    .refine((val) => !isNaN(val) && val >= 1, {
      message: "limit must be a positive integer",
    });
};

export const coinParamValidation = () => {
  return z
    .string()
    .optional()
    .transform((val) => (val ? val : "USDT"))
    .refine((val) => val === "VST" || val === "USDT", {
      message: "coin must be VST or USDT",
    });
};
