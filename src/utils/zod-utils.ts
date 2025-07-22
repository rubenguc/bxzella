import { z } from "zod";
import { getUTCDay } from "./date-utils";

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

// TODO: change return type based on isOptional
export const dateParamValidation = ({
  field,
  isOptional = true,
  tillEndOfTheDay = false,
}: {
  field: string;
  isOptional?: boolean;
  tillEndOfTheDay?: boolean;
}) => {
  if (isOptional) {
    return z
      .string()
      .optional()
      .refine((val) => !val || dateRegex.test(val), {
        message: `${field} must be in format YYYY-MM-DD`,
      })
      .transform((val) => {
        if (!val) return undefined;
        const date = getUTCDay(val, tillEndOfTheDay);
        if (!isNaN(date.getTime())) {
          return date;
        }
        return undefined;
      })
      .refine((date) => !date || !isNaN(date.getTime()), {
        message: `${field} must be a valid date`,
      });
  } else {
    return z
      .string()
      .refine((val) => dateRegex.test(val), {
        message: `${field} must be in format YYYY-MM-DD`,
      })
      .transform((val) => {
        const date = getUTCDay(val, tillEndOfTheDay);

        return date;
      })
      .refine((date) => !isNaN(date.getTime()), {
        message: `${field} must be a valid date`,
      });
  }
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
