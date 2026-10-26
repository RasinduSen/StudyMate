import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function NewAssignment() {
    const [title, setTitle] = useState('')
    const [brief, setBrief] = useState('')
    const [dueDate, setDueDate] = useState('')
    const [dueTime, setDueTime] = useState('00:00')
    const [message, setMessage] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const navigate = useNavigate()

    const handleSubmit = async (event) => {
        event.preventDefault()

        setMessage('')
        setIsLoading(true)

        try {
            const token = localStorage.getItem('token')

            const response = await fetch(
                'http://localhost:5000/api/assignments',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        title,
                        brief,
                        dueDate,
                        dueTime,
                    }),
                }
            )

            const data = await response.json()

            if (!response.ok) {
                throw new Error(
                    data.message || 'Could not create assignment.'
                )
            }

            setMessage('Assignment created successfully!')

            setTitle('')
            setBrief('')
            setDueDate('')
            setDueTime('')

            // Briefly show the success message before returning.
            setTimeout(() => {
                navigate('/')
            }, 800)
        } catch (error) {
            setMessage(error.message || 'Something went wrong.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-slate-100">
            <main className="mx-auto max-w-3xl px-6 py-10">
                <h1 className="text-3xl font-bold text-gray-900">
                    Create Assignment
                </h1>

                <p className="mt-2 text-gray-600">
                    Add your assignment details and StudyMate will help you plan it.
                </p>

                {message && (
                    <p
                        role="status"
                        className={`mt-6 rounded-lg p-4 ${message.includes('successfully')
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                            }`}
                    >
                        {message}
                    </p>
                )}

                <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Assignment Title
                        </label>

                        <input
                            type="text"
                            required
                            value={title}
                            onChange={(event) => setTitle(event.target.value)}
                            placeholder="e.g. Software Engineering Report"
                            className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-indigo-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Assignment Brief
                        </label>

                        <textarea
                            rows="8"
                            required
                            value={brief}
                            onChange={(event) => setBrief(event.target.value)}
                            placeholder="Explain the assignment details here"
                            className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-indigo-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Due Date
                        </label>

                        <input
                            type="date"
                            required
                            value={dueDate}
                            onChange={(event) => setDueDate(event.target.value)}
                            className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-indigo-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Due Time
                        </label>
                        <input
                            type="time"
                            required
                            value={dueTime}
                            onChange={(event) => setDueTime(event.target.value)}
                            className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-indigo-500"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full rounded-lg bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {isLoading ? 'Creating...' : 'Create Assignment'}
                    </button>
                </form>
            </main>
        </div>
    )
}

export default NewAssignment