import asyncHandler from '../utils/asyncHandler.js'
import { getRecords, getRecordById, createRecord, updateRecord, deleteRecord } from '../services/record.service.js'

// GET /api/records
export const getAllRecords = asyncHandler(async (req, res) => {
  const { role, userId } = req.user        // ← userId not id
  const records = await getRecords({ role, userId, query: req.query })
  res.status(200).json({ success: true, count: records.length, data: records })
})

// GET /api/records/:id
export const getRecord = asyncHandler(async (req, res) => {
  const { role, userId } = req.user       
  const record = await getRecordById({ id: req.params.id, role, userId })  
  res.status(200).json({ success: true, data: record })
})

// POST /api/records
export const addRecord = asyncHandler(async (req, res) => {
  const { userId } = req.user             
  const record = await createRecord({ userId, body: req.body })
  res.status(201).json({ success: true, data: record })
})

// PATCH /api/records/:id
export const editRecord = asyncHandler(async (req, res) => {
  const record = await updateRecord(req.params.id, req.body) 
  res.status(200).json({ success: true, data: record })
})

// DELETE /api/records/:id
export const removeRecord = asyncHandler(async (req, res) => {
  await deleteRecord(req.params.id)      
  res.status(200).json({ success: true, message: 'Record deleted successfully' })
})

