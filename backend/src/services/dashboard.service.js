// All aggregation queries for the dashboard.
import prisma from '../config/db.js'

// ── Summary — total income, expense, net balance ──────────────────
export const getSummary = async ({ role, userId }) => {
  // Viewer sees only their own summary
  const userFilter = role === 'VIEWER' ? { userId } : {}
  const baseWhere  = { isDeleted: false, ...userFilter }

  const [incomeData, expenseData] = await Promise.all([
    prisma.transaction.aggregate({
      where:  { ...baseWhere, type: 'INCOME' },
      _sum:   { amount: true },
      _count: { id: true },
    }),
    prisma.transaction.aggregate({
      where:  { ...baseWhere, type: 'EXPENSE' },
      _sum:   { amount: true },
      _count: { id: true },
    }),
  ])

  const totalIncome  = Number(incomeData._sum.amount  || 0)
  const totalExpense = Number(expenseData._sum.amount || 0)

  return {
    totalIncome,
    totalExpense,
    netBalance:       totalIncome - totalExpense,
    incomeCount:      incomeData._count.id,
    expenseCount:     expenseData._count.id,
  }
}

// ── Category breakdown ───────────────────────────
export const getCategoryBreakdown = async () => {
  const results = await prisma.transaction.groupBy({
    by:      ['category', 'type'],
    where:   { isDeleted: false },
    _sum:    { amount: true },
    _count:  { id: true },
    orderBy: { _sum: { amount: 'desc' } },
  })

  return results.map((r) => ({
    category: r.category,
    type:     r.type,
    total:    Number(r._sum.amount),
    count:    r._count.id,
  }))
}

// ── Monthly trend — income vs expense per month ───────────────────
export const getMonthlyTrend = async () => {
  // Raw query for month-level grouping — Prisma groupBy doesn't support date truncation
  const results = await prisma.$queryRaw`
    SELECT
      TO_CHAR(date, 'YYYY-MM')   AS month,
      type::text                 AS type,
      SUM(amount)::float         AS total,
      COUNT(id)::int             AS count
    FROM "Transaction"
    WHERE "isDeleted" = false
    GROUP BY month, type
    ORDER BY month ASC
  `

  return results
}

// ── Recent transactions ───────
export const getRecentTransactions = async ({ role, userId, limit = 10 }) => {
  const where = {
    isDeleted: false,
    ...(role === 'VIEWER' ? { userId } : {}),
  }

  return prisma.transaction.findMany({
    where,
    include: { user: { select: { name: true } } },
    orderBy: { date: 'desc' },
    take:    Number(limit),
  })
}