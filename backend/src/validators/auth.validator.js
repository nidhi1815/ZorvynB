import { z } from 'zod'

export const loginSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .email('Invalid email format'),

  password: z
    .string({ required_error: 'Password is required' })
    .min(6, 'Password must be at least 6 characters'),
})

export const createUserSchema = z.object({
  name: z
    .string({ required_error: 'Name is required' })
    .min(2, 'Name must be at least 2 characters')
    .max(100),

  email: z
    .string({ required_error: 'Email is required' })
    .email('Invalid email format'),

  password: z
    .string({ required_error: 'Password is required' })
    .min(8, 'Password must be at least 8 characters'),

  role: z
    .enum(['VIEWER', 'ANALYST', 'ADMIN'], {
      required_error: 'Role is required',
      invalid_type_error: 'Role must be VIEWER, ANALYST, or ADMIN',
    })
    .default('VIEWER'),
})

export const updateUserSchema = z.object({
  name: z.string().min(2).max(100).optional(),

  role: z
    .enum(['VIEWER', 'ANALYST', 'ADMIN'])
    .optional(),

  isActive: z.boolean().optional(),
})