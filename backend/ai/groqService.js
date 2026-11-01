
const Groq = require('groq-sdk')
const buildPrompt = require('./promptBuilder')

require('dotenv').config()

if (!process.env.GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY is missing from the backend .env file')
}

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
})

async function analyzeAssignment(assignment) {
    const prompt = buildPrompt(assignment)

    const completion = await groq.chat.completions.create({
        model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
        messages: [
            {
                role: 'system',
                content:
                    'You are StudyMate, an academic study planning assistant. Return valid JSON only, following the requested structure.',
            },
            {
                role: 'user',
                content: prompt,
            },
        ],
        temperature: 0.3,
        response_format: {
            type: 'json_object',
        },
    })

    const responseText = completion.choices[0]?.message?.content

    if (!responseText) {
        throw new Error('Groq returned an empty response')
    }

    const result = JSON.parse(responseText)

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
        throw new Error('Groq returned an invalid assignment analysis')
    }

    return result
}

module.exports = analyzeAssignment
