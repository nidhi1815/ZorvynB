import { Router } from 'express'
import {
  getAllRecords,
  getRecord,
  addRecord,
  editRecord,
  removeRecord,
} from '../controllers/record.controller.js'
import authMiddleware from '../middleware/auth.middleware.js'
import authorize      from '../middleware/role.middleware.js'
import validate       from '../middleware/validate.middleware.js'
import {
  createRecordSchema,
  updateRecordSchema,
} from '../validators/record.validator.js'

const router = Router()

// All record routes require a valid token
router.use(authMiddleware)

/**
 * @swagger
 * tags:
 *   name: Records
 *   description: Financial transaction records
 */

/**
 * @swagger
 * /api/records:
 *   get:
 *     summary: Get financial records
 *     tags: [Records]
 *     security:
 *       - bearerAuth: []
 *     description: |
 *       - **VIEWER** — returns only their own records
 *       - **ANALYST / ADMIN** — returns all records
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [INCOME, EXPENSE]
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         example: Rent
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         example: 2026-01-01
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         example: 2026-03-31
 *     responses:
 *       200:
 *         description: List of records
 */
router.get('/', getAllRecords)

/**
 * @swagger
 * /api/records/{id}:
 *   get:
 *     summary: Get a single record by ID
 *     tags: [Records]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Record found
 *       403:
 *         description: Viewer trying to access another user's record
 *       404:
 *         description: Record not found
 */
router.get('/:id', getRecord)

/**
 * @swagger
 * /api/records:
 *   post:
 *     summary: Create a new financial record (Admin only)
 *     tags: [Records]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [amount, type, category, date]
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 50000
 *               type:
 *                 type: string
 *                 enum: [INCOME, EXPENSE]
 *               category:
 *                 type: string
 *                 example: Salary
 *               date:
 *                 type: string
 *                 format: date
 *                 example: 2026-04-01
 *               description:
 *                 type: string
 *                 example: April salary payment
 *     responses:
 *       201:
 *         description: Record created
 *       403:
 *         description: Admin access required
 */
router.post('/', authorize('ADMIN'), validate(createRecordSchema), addRecord)

/**
 * @swagger
 * /api/records/{id}:
 *   patch:
 *     summary: Update a record (Admin only)
 *     tags: [Records]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *               category:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Record updated
 */
router.patch('/:id', authorize('ADMIN'), validate(updateRecordSchema), editRecord)

/**
 * @swagger
 * /api/records/{id}:
 *   delete:
 *     summary: Soft delete a record (Admin only)
 *     tags: [Records]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Record deleted (soft)
 */
router.delete('/:id', authorize('ADMIN'), removeRecord)

export default router