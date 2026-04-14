import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import healthRoutes from './routes/health.js'

export const createApp = () => {
  const app = express()

  const allowedOrigins = [
    'http://localhost:5173',
    'https://prompt-wars-43ba6.web.app'
  ]

  app.use(
    cors({
      origin: function (origin, callback) {
        // allow requests with no origin (mobile apps, curl)
        if (!origin) return callback(null, true)

        if (allowedOrigins.includes(origin)) {
          return callback(null, true)
        } else {
          return callback(new Error('CORS not allowed'), false)
        }
      },
      credentials: true
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
