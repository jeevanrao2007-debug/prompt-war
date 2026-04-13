import { createApp } from './app.js'

const app = createApp()
const PORT = process.env.PORT || 8080

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`)
})

export default app
