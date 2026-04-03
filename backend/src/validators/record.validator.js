import { z } from 'zod'

export const createRecordSchema = z.object({
  amount: z
    .number({ required_error: 'Amount is required' })
    .positive('Amount must be greater than 0'),

  type: z.enum(['INCOME', 'EXPENSE'], {
    required_error: 'Type is required',
    invalid_type_error: 'Type must be INCOME or EXPENSE',
  }),

  category: z
    .string({ required_error: 'Category is required' })
    .min(2, 'Category must be at least 2 characters')
    .max(100),

  date: z
    .string({ required_error: 'Date is required' })
    .transform((val) => new Date(val))
    .refine((d) => !isNaN(d.getTime()), { message: 'Invalid date format' }),

  description: z.string().max(500).optional(),
})

export const updateRecordSchema = z.object({
  amount: z.number().positive().optional(),

  type: z.enum(['INCOME', 'EXPENSE']).optional(),

  category: z.string().min(2).max(100).optional(),

  date: z
    .string()
    .transform((val) => new Date(val))
    .refine((d) => !isNaN(d.getTime()), { message: 'Invalid date format' })
    .optional(),

  description: z.string().max(500).optional(),
})
