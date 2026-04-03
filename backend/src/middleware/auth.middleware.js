// Runs before every protected route.
// Checks that a valid JWT token is present in the Authorization header.
// Attaches decoded user info to req.user so controllers can use it.

import jwt from 'jsonwebtoken'
import AppError from '../utils/AppError.js'

const authMiddleware = (req, res, next) => {
  // 1. Read the token from the Authorization header
  //    Frontend sends:  Authorization: Bearer eyJhbGci...
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('No token provided. Please login.', 401))
  }

  const token = authHeader.split(' ')[1]

  // 2. Verify the token using our secret key
  //    If token is fake, expired, or tampered — jwt.verify throws
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // 3. Attach user info to req so every controller can access it
    //    req.user = { userId, role, email }
    req.user = {
      userId: decoded.userId,
      role:   decoded.role,
      email:  decoded.email,
    }

    next()
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(new AppError('Session expired. Please login again.', 401))
    }
    return next(new AppError('Invalid token. Please login again.', 401))
  }
}

export default authMiddleware