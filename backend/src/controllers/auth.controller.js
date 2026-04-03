import asyncHandler   from '../utils/asyncHandler.js'
import { loginUser, createUser } from '../services/auth.service.js'
 
// POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  const result = await loginUser(req.body)
  res.status(200).json({ success: true, ...result })
})
 
// POST /api/auth/register  (Admin only — guarded in route)
export const register = asyncHandler(async (req, res) => {
  const user = await createUser(req.body)
  res.status(201).json({ success: true, data: user })
})
 