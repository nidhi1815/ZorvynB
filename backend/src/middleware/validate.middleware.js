// Takes a Zod schema and returns a middleware that validates req.body.
// If validation fails, returns a clean 400 with all field errors listed.
// Usage: router.post('/endpoint', validate(zodSchema), controllerFunction)


const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body)

  if (!result.success) {
    // Zod v3 stores errors in result.error.issues 
    const issues = result.error?.issues || []

    const errors = issues.map((e) => ({
      field:   e.path?.join('.') || 'unknown',
      message: e.message,
    }))

    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors,
    })
  }

  req.body = result.data
  next()
}

export default validate