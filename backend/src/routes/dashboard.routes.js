import { Router } from 'express'
import {
  summary,
  byCategory,
  monthlyTrend,
  recentTransactions,
} from '../controllers/dashboard.controller.js'
import authMiddleware from '../middleware/auth.middleware.js'
import authorize      from '../middleware/role.middleware.js'

const router = Router()

router.use(authMiddleware)

/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Analytics and summary data
 */

/**
 * @swagger
 * /api/dashboard/summary:
 *   get:
 *     summary: Get total income, expense and net balance
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     description: |
 *       - **VIEWER** — summary of their own records only
 *       - **ANALYST / ADMIN** — summary of all records
 *     responses:
 *       200:
 *         description: Summary data
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 totalIncome: 485000
 *                 totalExpense: 83500
 *                 netBalance: 401500
 *                 incomeCount: 4
 *                 expenseCount: 4
 */
router.get('/summary', summary)

/**
 * @swagger
 * /api/dashboard/by-category:
 *   get:
 *     summary: Get totals grouped by category (Analyst, Admin)
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     description: Requires ANALYST or ADMIN role
 *     responses:
 *       200:
 *         description: Category breakdown
 *       403:
 *         description: Access denied
 */
router.get('/by-category', authorize('ANALYST', 'ADMIN'), byCategory)

/**
 * @swagger
 * /api/dashboard/monthly-trend:
 *   get:
 *     summary: Get monthly income vs expense trend (Analyst, Admin)
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     description: Requires ANALYST or ADMIN role
 *     responses:
 *       200:
 *         description: Monthly trend data
 */
router.get('/monthly-trend', authorize('ANALYST', 'ADMIN'), monthlyTrend)

/**
 * @swagger
 * /api/dashboard/recent:
 *   get:
 *     summary: Get recent transactions
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Recent transactions
 */
router.get('/recent', recentTransactions)

export default router