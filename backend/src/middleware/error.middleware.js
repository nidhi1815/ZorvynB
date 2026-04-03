// Global error handler — registered LAST in app.js.
// Catches every error thrown anywhere in the app (via next(err) or asyncHandler).
// Formats a consistent error response — no raw stack traces sent to client.

const errorMiddleware = (err, req, res, next) => {
  // Default to 500 if no statusCode was set
  let statusCode = err.statusCode || 500
  let message    = err.message    || 'Something went wrong'

  // Handle Prisma unique constraint violations (e.g. duplicate email)
  if (err.code === 'P2002') {
    statusCode = 409
    message    = `${err.meta?.target?.[0] || 'Field'} already exists`
  }

  // Handle Prisma record not found
  if (err.code === 'P2025') {
    statusCode = 404
    message    = 'Record not found'
  }

  // Log full error in development only
  if (process.env.NODE_ENV === 'development') {
    console.error('ERROR:', err)
  }

  res.status(statusCode).json({
    success:    false,
    message,
    // Show stack trace in development for debugging
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  })
}

export default errorMiddleware