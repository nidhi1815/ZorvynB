// Factory function — returns a middleware that checks the user's role.
// Must run AFTER authMiddleware (needs req.user to be set).
//
// Usage in routes:
//   router.delete('/:id', authMiddleware, authorize('ADMIN'), deleteRecord)
//   router.get('/summary', authMiddleware, authorize('ADMIN','ANALYST'), getSummary)

import AppError from '../utils/AppError.js'

const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    // req.user was set by authMiddleware
    if (!req.user) {
      return next(new AppError('Not authenticated.', 401))
    }

    const userRole = req.user.role

    if (!allowedRoles.includes(userRole)) {
      return next(
        new AppError(
          `Access denied. This action requires: ${allowedRoles.join(' or ')}.`,
          403
        )
      )
    }

    next()
  }
}

export default authorize