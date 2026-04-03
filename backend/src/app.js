// Express app setup.
//middleware registered top to bottom.

import express        from 'express'
import cors           from 'cors'
import helmet         from 'helmet'
import swaggerUi      from 'swagger-ui-express'
import swaggerSpec    from './config/swagger.js'
import authRoutes     from './routes/auth.routes.js'
import userRoutes     from './routes/user.routes.js'
import recordRoutes   from './routes/record.routes.js'
import dashboardRoutes from './routes/dashboard.routes.js'
import errorMiddleware from './middleware/error.middleware.js'

const app = express()

// ── Security & parsing middleware ─────────────────────────────────
app.use(helmet())                          // sets secure HTTP headers
app.use(cors({ origin: 'http://localhost:5173' }))  // allow Vite frontend
app.use(express.json())                    // parse JSON request bodies
app.use(express.urlencoded({ extended: true }))

// ── Health check ──────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Zorvyn API is running' })
})

// ── Swagger docs ──────────────────────────────────────────────────
// Visit: http://localhost:5000/api/docs
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

// ── API Routes ────────────────────────────────────────────────────
app.use('/api/auth',      authRoutes)
app.use('/api/users',     userRoutes)
app.use('/api/records',   recordRoutes)
app.use('/api/dashboard', dashboardRoutes)

// ── 404 handler — unknown routes ──────────────────────────────────
// app.all('*', (req, res) => {
//   res.status(404).json({
//     success: false,
//     message: `Route ${req.method} ${req.originalUrl} not found`,
//   })
// })
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  })
})

// ── Global error handler — MUST be last ───────────────────────────
app.use(errorMiddleware)

export default app