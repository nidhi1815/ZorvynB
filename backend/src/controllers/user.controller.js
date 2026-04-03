import asyncHandler from '../utils/asyncHandler.js'
import { getAllUsers, getUserById, updateUser, deactivateUser } from '../services/user.service.js'



// GET /api/users
export const getUsers = asyncHandler(async (req, res) => {
  const users = await getAllUsers()
  res.status(200).json({ success: true, count: users.length, data: users })
})
// GET /api/users/:id
export const getUser = asyncHandler(async (req, res) => {
  const user = await getUserById(req.params.id)     
  res.status(200).json({ success: true, data: user })
})

// export const getUser = asyncHandler(async (req, res) => {
//   console.log('params:', req.params)   // ← add this line
//   const user = await getUserById(req.params.id)
//   res.status(200).json({ success: true, data: user })
// })

// PATCH /api/users/:id
export const updateUserById = asyncHandler(async (req, res) => {
  const user = await updateUser(req.params.id, req.body)   
  res.status(200).json({ success: true, data: user })
})

// DELETE /api/users/:id (soft delete)
export const deleteUser = asyncHandler(async (req, res) => {
  const user = await deactivateUser(req.params.id, req.user.userId) 
  res.status(200).json({ success: true, message: 'User deactivated', data: user })
})