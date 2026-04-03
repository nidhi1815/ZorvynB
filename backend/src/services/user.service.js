// All user management logic — Admin only operations.

import prisma from '../config/db.js'
import AppError from '../utils/AppError.js'

const safeUserSelect = {
  id:        true,
  name:      true,
  email:     true,
  role:      true,
  isActive:  true,
  createdAt: true,
  updatedAt: true,
  // password: false — never returned
}

// ── Get all users ─────────────────────────────────────────────────
export const getAllUsers = async () => {
  return prisma.user.findMany({
    select:  safeUserSelect,
    orderBy: { createdAt: 'desc' },
  })
}

// ── Get single user ───────────────────────────────────────────────
export const getUserById = async (id) => {
  const user = await prisma.user.findUnique({
    where:  { id },
    select: safeUserSelect,
  })

  if (!user) throw new AppError('User not found', 404)

  return user
}

// ── Update user role or status ────────────────────────────────────
export const updateUser = async (id, data) => {
  const user = await prisma.user.findUnique({ where: { id } })

  if (!user) throw new AppError('User not found', 404)

  return prisma.user.update({
    where:  { id },
    data,
    select: safeUserSelect,
  })
}

// ── Soft delete (deactivate) user ─────────────────────────────────
export const deactivateUser = async (id, requestingUserId) => {
  if (id === requestingUserId) {
    throw new AppError('You cannot deactivate your own account', 400)
  }

  const user = await prisma.user.findUnique({ where: { id } })

  if (!user) throw new AppError('User not found', 404)

  return prisma.user.update({
    where:  { id },
    data:   { isActive: false },
    select: safeUserSelect,
  })
}