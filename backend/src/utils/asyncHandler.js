// Wraps every async controller so we never need try-catch in controllers.
// Any error thrown inside automatically goes to the global error middleware.
//
// Usage: export const myController = asyncHandler(async (req, res) => { ... })

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next)
}

export default asyncHandler
