
const { GoogleGenAI } = require('@google/genai')
const buildPrompt = require('./promptBuilder')
const analyzeWithGroq = require('./groqService')

require('dotenv').config()

if (!process.env.GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY is missing from the backend .env file')
}

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
})


async function analyzeAssignment(assignment) {
  const prompt = buildPrompt(assignment)

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'OBJECT',
          properties: {
            summary: { type: 'STRING' },
            adaptationExplanation: { type: 'STRING' },
            requirements: {
              type: 'ARRAY',
              items: { type: 'STRING' },
            },
            tasks: {
              type: 'ARRAY',
              items: {
                type: 'OBJECT',
                properties: {
                  title: { type: 'STRING' },
                  description: { type: 'STRING' },
                  estimatedHours: { type: 'NUMBER' },
                  priority: {
                    type: 'STRING',
                    enum: ['low', 'medium', 'high'],
                  },
                },
                required: [
                  'title',
                  'description',
                  'estimatedHours',
                  'priority',
                ],
              },
            },
          },
          required: [
            'summary',
            'adaptationExplanation',
            'requirements',
            'tasks',
          ],
        },
      },
    })

    if (!response.text) {
      throw new Error('Gemini returned an empty response')
    }

    const result = JSON.parse(response.text)

    if (
      typeof result.summary !== 'string' ||
      typeof result.adaptationExplanation !== 'string' ||
      !Array.isArray(result.requirements) ||
      !Array.isArray(result.tasks) ||
      result.tasks.some(
        (task) =>
          typeof task.title !== 'string' ||
          typeof task.description !== 'string' ||
          typeof task.estimatedHours !== 'number' ||
          !Number.isFinite(task.estimatedHours) ||
          task.estimatedHours <= 0 ||
          !['low', 'medium', 'high'].includes(task.priority)
      )
    ) {
      throw new Error('Gemini returned an invalid assignment analysis')
    }

    console.log('Study plan generated using Gemini')
    return result

  } catch (error) {
    const status = Number(error.code ?? error.status)

    if ([429, 503, 504].includes(status)) {
      console.warn(
        `Gemini unavailable (HTTP ${status}). Switching to Groq...`
      )

      try {
        const result = await analyzeWithGroq(assignment)
        console.log('Study plan generated using Groq fallback')
        return result
      } catch (groqError) {
        console.error('Groq fallback also failed:', groqError.message)
        throw new Error(
          'Both Gemini and Groq failed to generate the study plan.'
        )
      }
    }

    throw error
  }
}

module.exports = analyzeAssignment
