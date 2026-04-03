// Handles login and user creation logic.
// No req/res here — just plain functions that take data and return data.

import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import prisma from '../config/db.js'
import AppError from '../utils/AppError.js'

// ── Login ───
export const loginUser = async ({ email, password }) => {
  // 1. Find user by email
  const user = await prisma.user.findUnique({ where: { email } })

  if (!user) {
    throw new AppError('Invalid email or password', 401)
  }

  // 2. Check if account is active
  if (!user.isActive) {
    throw new AppError('Your account has been deactivated. Contact admin.', 403)
  }

  // 3. Compare entered password with stored hash
  const isPasswordValid = await bcrypt.compare(password, user.password)

  if (!isPasswordValid) {
    throw new AppError('Invalid email or password', 401)
  }

  // 4. Create JWT — role comes from DB, not from user input
  const token = jwt.sign(
    {
      userId: user.id,
      role:   user.role,
      email:  user.email,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  )

  // 5. Return token + safe user object (no password)
  return {
    token,
    user: {
      id:    user.id,
      name:  user.name,
      email: user.email,
      role:  user.role,
    },
  }
}

// ── Create user (Admin only) ──────────────────────────────────────
export const createUser = async ({ name, email, password, role }) => {
  // Hash password before storing
  const hashedPassword = await bcrypt.hash(password, 10)

  const user = await prisma.user.create({
    data: { name, email, password: hashedPassword, role },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  })

  return user
}