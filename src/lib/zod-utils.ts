import { z } from 'zod'

const dateRegex = /^\d{4}-\d{2}-\d{2}$/

export function dateParamValidation({ field }: { field: string }) {
  return z.string().refine((val) => dateRegex.test(val), {
    message: `${field} must be in format YYYY-MM-DD`,
  })
}

export function dateParamValidationOptional({ field }: { field: string }) {
  return z
    .string()
    .optional()
    .refine((val) => !val || dateRegex.test(val), {
      message: `${field} must be in format YYYY-MM-DD`,
    })
}

export function accountIdParamValidation() {
  return z.string().min(1, 'accountId is required')
}

export function pageParamValidation() {
  return z
    .string()
    .optional()
    .transform((val) => (val && Number(val) >= 0 ? parseInt(val, 10) : 0))
    .refine((val) => !Number.isNaN(val) && val >= 0, {
      message: 'page must be a number greater than or equal to zero',
    })
}

export function limitParamValidation({ max = 100, default: def = 20 } = {}) {
  return z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : def))
    .refine((val) => !Number.isNaN(val) && val >= 1 && val <= max, {
      message: `limit must be between 1 and ${max}`,
    })
}

export function coinParamValidation() {
  return z
    .string()
    .optional()
    .transform((val) => (val ?? 'USDT'))
    .refine((val) => val === 'VST' || val === 'USDT' || val === 'USDC', {
      message: 'coin must be VST, USDT, or USDC',
    })
}
