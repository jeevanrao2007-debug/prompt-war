import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY)

export async function generateAIInsight(data) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' })

    const prompt = `
You are a crowd management assistant.

Data:
Gate A: ${data.gateA}
Food Court: ${data.foodCourt}
Seating: ${data.seating}

Give:
- short risk analysis
- one recommendation

Keep it under 2 lines.
`

    const result = await model.generateContent(prompt)
    return result.response.text()
  } catch (e) {
    return 'AI insight unavailable'
  }
}
