import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

function EditAssignment() {
    const { id } = useParams()
    const navigate = useNavigate()

    const [title, setTitle] = useState('')
    const [brief, setBrief] = useState('')
    const [dueDate, setDueDate] = useState('')
    const [message, setMessage] = useState('')
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        const fetchAssignment = async () => {
            try {
                const token = localStorage.getItem('token')

                const response = await fetch(
                    `http://localhost:5000/api/assignments`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                )

                const data = await response.json()
                console.log('Assignments API response:', data)

                if (!response.ok) {
                    throw new Error(data.message || 'Could not load assignments.')
                }

                const assignment = data.assignments.find(
                    (item) => item.id === Number(id)
                )

                if (!assignment) {
                    throw new Error('Assignment not found.')
                }

                setTitle(assignment.title)
                setBrief(assignment.brief)
                setDueDate(assignment.dueDate)
            } catch (error) {
                console.error('Get assignment error:', error)
                setMessage(error.message || 'Could not load assignment.')
            } finally {
                setIsLoading(false)
            }
        }

        fetchAssignment()
    }, [id])

    const handleSubmit = async (event) => {
        event.preventDefault()

        setMessage('')
        setIsSaving(true)

        try {
            const token = localStorage.getItem('token')

            const response = await fetch(
                `http://localhost:5000/api/assignments/${id}`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        title,
                        brief,
                        dueDate,
                    }),
                }
            )

            const data = await response.json()

            if (!response.ok) {
                throw new Error(
                    data.message || 'Could not update assignment.'
                )
            }

            setMessage('Assignment updated successfully!')

            setTimeout(() => {
                navigate('/')
            }, 800)
        } catch (error) {
            console.error('Update assignment error:', error)
            setMessage(error.message || 'Something went wrong.')
        } finally {
            setIsSaving(false)
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-100">
                <main className="mx-auto max-w-3xl px-6 py-10">
                    <p className="text-gray-600">Loading assignment...</p>
                </main>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-100">
            <main className="mx-auto max-w-3xl px-6 py-10">
                <h1 className="text-3xl font-bold text-gray-900">
                    Edit Assignment
                </h1>

                <p className="mt-2 text-gray-600">
                    Update your assignment details below.
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

                    <button
                        type="submit"
                        disabled={isSaving}
                        className="w-full rounded-lg bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>

                    <button
                        type="button"
                        onClick={() => navigate('/')}
                        className="w-full rounded-lg border border-gray-300 bg-white px-5 py-3 font-semibold text-gray-700 hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                </form>
            </main>
        </div>
    )
}

export default EditAssignment