// Financial records CRUD + filtering.
// KEY LOGIC: Viewer sees only their own records — enforced in the DB query here.

import prisma from '../config/db.js'
import AppError from '../utils/AppError.js'

// ── Get records (with role filtering + query filters) ─────────────
export const getRecords = async ({ role, userId, query }) => {
  const where = { isDeleted: false }

  // Row-level security — Viewer only sees their own records
  if (role === 'VIEWER') {
    where.userId = userId
  }

  // Optional filters from query params
  // e.g. GET /api/records?type=EXPENSE&category=Rent&startDate=2026-01-01
  if (query.type)     where.type     = query.type.toUpperCase()
  if (query.category) where.category = { contains: query.category, mode: 'insensitive' }

  if (query.startDate || query.endDate) {
    where.date = {}
    if (query.startDate) where.date.gte = new Date(query.startDate)
    if (query.endDate)   where.date.lte = new Date(query.endDate)
  }

  const records = await prisma.transaction.findMany({
    where,
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
    orderBy: { date: 'desc' },
  })

  return records
}

// ── Get single record ─────────────────────────────────────────────
export const getRecordById = async ({ id, role, userId }) => {
  const record = await prisma.transaction.findFirst({
    where: { id, isDeleted: false },
    include: { user: { select: { id: true, name: true } } },
  })

  if (!record) throw new AppError('Record not found', 404)

  // Viewer can only see their own record
  if (role === 'VIEWER' && record.userId !== userId) {
    throw new AppError('Access denied', 403)
  }

  return record
}

// ── Create record (Admin only) ────────────────────────────────────
export const createRecord = async ({ userId, body }) => {
  return prisma.transaction.create({
    data: {
      userId,
      amount:      body.amount,
      type:        body.type,
      category:    body.category,
      date:        body.date,
      description: body.description,
    },
  })
}

// ── Update record (Admin only) ────────────────────────────────────
export const updateRecord = async (id, data) => {
  const record = await prisma.transaction.findFirst({
    where: { id, isDeleted: false },
  })

  if (!record) throw new AppError('Record not found', 404)

  return prisma.transaction.update({ where: { id }, data })
}

// ── Soft delete (Admin only) ──────────────────────────────────────
export const deleteRecord = async (id) => {
  const record = await prisma.transaction.findFirst({
    where: { id, isDeleted: false },
  })

  if (!record) throw new AppError('Record not found', 404)

  return prisma.transaction.update({
    where: { id },
    data:  { isDeleted: true },
  })
}