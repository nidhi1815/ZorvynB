// Single Prisma instance shared across the whole app.
// Importing it multiple times always returns the same connection.

import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error'] : ['error'],
})
 
export default prisma