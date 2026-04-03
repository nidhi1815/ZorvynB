import swaggerJsdoc from 'swagger-jsdoc'

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title:       'Zorvyn Finance Dashboard API',
      version:     '1.0.0',
      description: 'Finance dashboard backend — role-based access control with JWT',
    },
    servers: [{ url: 'http://localhost:5000' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type:         'http',
          scheme:       'bearer',
          bearerFormat: 'JWT',
          description:  'Paste your JWT token here (get it from POST /api/auth/login)',
        },
      },
    },
  },
  // Swagger reads JSDoc comments from these files
  apis: ['./src/routes/*.js'],
}

const swaggerSpec = swaggerJsdoc(options)

export default swaggerSpec