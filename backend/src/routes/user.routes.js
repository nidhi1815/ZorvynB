import { Router } from 'express'
import {
  getUsers,
  getUser,
  updateUserById,
  deleteUser,
} from '../controllers/user.controller.js'
import authMiddleware from '../middleware/auth.middleware.js'
import authorize      from '../middleware/role.middleware.js'
import validate       from '../middleware/validate.middleware.js'
import { updateUserSchema } from '../validators/auth.validator.js'

const router = Router()

// All user routes require Admin role
//router.use(authMiddleware, authorize('ADMIN'))-

router.get('/',    authMiddleware, authorize('ADMIN'), getUsers)
router.get('/:id', authMiddleware, authorize('ADMIN'), getUser)
router.patch('/:id', authMiddleware, authorize('ADMIN'), validate(updateUserSchema), updateUserById)
router.delete('/:id', authMiddleware, authorize('ADMIN'), deleteUser)

/**
 * @swagger 
 * tags:
 *   name: Users
 *   description: User management — Admin only
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     description: Requires ADMIN role
 *     responses:
 *       200:
 *         description: List of all users
 *       403:
 *         description: Admin access required
 */
router.get('/', getUsers)

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get a single user by ID
 *     tags: [Users]
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
 *         description: User found
 *       404:
 *         description: User not found
 */
router.get('/:id', getUser)

/**
 * @swagger
 * /api/users/{id}:
 *   patch:
 *     summary: Update user role or status
 *     tags: [Users]
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
 *               role:
 *                 type: string
 *                 enum: [VIEWER, ANALYST, ADMIN]
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: User updated
 */
router.patch('/:id', validate(updateUserSchema), updateUserById)

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Deactivate a user (soft delete)
 *     tags: [Users]
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
 *         description: User deactivated
 *       400:
 *         description: Cannot deactivate your own account
 */
router.delete('/:id', deleteUser)

export default router