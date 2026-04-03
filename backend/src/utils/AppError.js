// Custom error class. Instead of throwing generic errors,
// we throw AppError so the global handler can format them cleanly.

// Usage: throw new AppError('User not found', 404)
 
class AppError extends Error {
  constructor(message, statusCode) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = true       // our own known errors, not crashes
    Error.captureStackTrace(this, this.constructor)
  }
}
 
export default AppError