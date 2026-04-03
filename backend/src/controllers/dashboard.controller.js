import asyncHandler from '../utils/asyncHandler.js'
import {
  getSummary,
  getCategoryBreakdown,
  getMonthlyTrend,
  getRecentTransactions,
} from '../services/dashboard.service.js'

// GET /api/dashboard/summary
export const summary = asyncHandler(async (req, res) => {
  const { role, userId } = req.user        // ← userId directly, no renaming
  const data = await getSummary({ role, userId })
  res.status(200).json({ success: true, data })
})

// GET /api/dashboard/by-category
export const byCategory = asyncHandler(async (req, res) => {
  const data = await getCategoryBreakdown()
  res.status(200).json({ success: true, data })
})

// GET /api/dashboard/monthly-trend
export const monthlyTrend = asyncHandler(async (req, res) => {
  const data = await getMonthlyTrend()
  res.status(200).json({ success: true, data })
})

// GET /api/dashboard/recent
export const recentTransactions = asyncHandler(async (req, res) => {
  const { role, userId } = req.user        // ← userId directly, no renaming
  const { limit = 10 } = req.query
  const data = await getRecentTransactions({ role, userId, limit })
  res.status(200).json({ success: true, data })
})