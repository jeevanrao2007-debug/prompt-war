import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import healthRoutes from './routes/health.js'

export const createApp = () => {
  const app = express()
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173'

  app.use(
    cors({
      origin: frontendUrl,
    })
  )
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", 'https://maps.googleapis.com', 'https://maps.gstatic.com'],
          connectSrc: ["'self'", 'https://maps.googleapis.com', 'https://maps.gstatic.com'],
          imgSrc: ["'self'", 'data:', 'https://maps.googleapis.com', 'https://maps.gstatic.com'],
          styleSrc: ["'self'", "'unsafe-inline'", 'https://maps.googleapis.com', 'https://maps.gstatic.com'],
          fontSrc: ["'self'", 'data:', 'https://maps.gstatic.com'],
          workerSrc: ["'self'", 'blob:', 'https://maps.gstatic.com'],
          objectSrc: ["'none'"],
          baseUri: ["'self'"],
          frameAncestors: ["'self'"],
        },
      },
    })
  )
  app.use((req, res, next) => {
    console.log(`[REQ] ${req.method} ${req.originalUrl} origin=${req.headers.origin || 'n/a'}`)
    next()
  })
  app.use(express.json())

  app.use('/api', healthRoutes)

  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'Server running' })
  })

  app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).json({ error: 'Internal Server Error' })
  })

  return app
}

export default createApp
