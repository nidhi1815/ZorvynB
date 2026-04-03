import 'dotenv/config'
import app from './src/app.js'

const PORT = process.env.PORT || 8000

app.listen(PORT, () => {
  console.log('─────────────────────────────────────')
  console.log(`  Zorvyn API running on port ${PORT}`)
  console.log(`  Swagger docs → http://localhost:${PORT}/api/docs`)
  console.log(`  Health check → http://localhost:${PORT}/health`)
  console.log('─────────────────────────────────────')
})