import { Router } from 'express'
import { login, register }   from '../controllers/auth.controller.js'
import authMiddleware        from '../middleware/auth.middleware.js'
import authorize             from '../middleware/role.middleware.js'
import validate              from '../middleware/validate.middleware.js'
import { loginSchema, createUserSchema } from '../validators/auth.validator.js'

const router = Router()

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Login and user registration
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login and get JWT token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 example: admin@zorvyn.io
 *               password:
 *                 type: string
 *                 example: Admin@123
 *     responses:
 *       200:
 *         description: Login successful — returns token and role
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', validate(loginSchema), login)

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Create a new user (Admin only)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password, role]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Priya Sharma
 *               email:
 *                 type: string
 *                 example: priya@zorvyn.io
 *               password:
 *                 type: string
 *                 example: Password@123
 *               role:
 *                 type: string
 *                 enum: [VIEWER, ANALYST, ADMIN]
 *                 example: ANALYST
 *     responses:
 *       201:
 *         description: User created successfully
 *       403:
 *         description: Admin access required
 */
router.post(
  '/register',
  authMiddleware,
  authorize('ADMIN'),
  validate(createUserSchema),
  register
)

export default router