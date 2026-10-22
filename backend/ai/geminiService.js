
const { GoogleGenAI } = require('@google/genai')
const buildPrompt = require('./promptBuilder')

require('dotenv').config()

if (!process.env.GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY is missing from the backend .env file')
}

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
})

async function analyzeAssignment(assignment) {
  const prompt = buildPrompt(assignment)

  const response = await ai.models.generateContent({
    model: 'gemini-3.8-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: 'OBJECT',
        properties: {
          summary: { type: 'STRING' },
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
        required: ['summary', 'requirements', 'tasks'],
      },
    },
  })

  if (!response.text) {
    throw new Error('Gemini returned an empty response')
  }

  const result = JSON.parse(response.text)

  if (
    typeof result.summary !== 'string' ||
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

  return result
}

module.exports = analyzeAssignment
