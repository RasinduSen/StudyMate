
import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'

function AssignmentAnalysis() {
    const { id } = useParams()

    const [analysis, setAnalysis] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        const fetchAnalysis = async () => {
            setLoading(true)
            setError('')
            setAnalysis(null)

            try {
                const token = localStorage.getItem('token')

                if (!token) {
                    throw new Error('Please log in again to continue.')
                }

                const response = await fetch(
                    `http://localhost:5000/api/assignments/${id}/study-plan`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                )

                const data = await response.json()

                if (!response.ok) {
                    throw new Error(
                        data.message || 'Failed to analyze assignment.'
                    )
                }

                setAnalysis(data.studyPlan)
            } catch (error) {
                setError(
                    error.message || 'Something went wrong. Please try again.'
                )
            } finally {
                setLoading(false)
            }
        }

        fetchAnalysis()
    }, [id])

    const handleStatusChange = async (taskId, newStatus) => {
        try {
            const token = localStorage.getItem('token')

            const response = await fetch(
                `http://localhost:5000/api/study-tasks/${taskId}/status`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        status: newStatus,
                    }),
                }
            )

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.message || 'Failed to update task status.')
            }

            setAnalysis((currentAnalysis) => ({
                ...currentAnalysis,
                tasks: currentAnalysis.tasks.map((task) =>
                    task.id === taskId
                        ? { ...task, status: newStatus }
                        : task
                ),
            }))
        } catch (error) {
            console.error('Update task status error:', error)
            setError(error.message || 'Could not update task status.')
        }
    }

    return (
        <main className="min-h-screen bg-slate-100 px-6 py-10">
            <div className="mx-auto max-w-4xl">
                <Link
                    to="/"
                    className="font-medium text-indigo-600 hover:underline"
                >
                    ← Back to Dashboard
                </Link>

                <h1 className="mt-6 text-3xl font-bold text-gray-900">
                    AI Assignment Analysis
                </h1>

                <p className="mt-2 text-sm text-gray-500">
                    Assignment ID: {id}
                </p>

                {loading && (
                    <section className="mt-8 rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
                        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />

                        <p className="mt-4 font-medium text-gray-800">
                            Analysing your assignment...
                        </p>

                        <p className="mt-2 text-sm text-gray-500">
                            Gemini is reviewing the assignment and preparing your
                            suggested tasks. This may take a little while.
                        </p>
                    </section>
                )}

                {!loading && error && (
                    <section className="mt-8 rounded-xl border border-red-200 bg-white p-6 shadow-sm">
                        <h2 className="text-lg font-semibold text-red-700">
                            Analysis unavailable
                        </h2>

                        <p className="mt-2 text-gray-600">
                            {error}
                        </p>

                        <button
                            onClick={() => window.location.reload()}
                            className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700"
                        >
                            Try Again
                        </button>
                    </section>
                )}

                {!loading && analysis && (
                    <>
                        <section className="mt-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                            <h2 className="text-xl font-semibold text-gray-900">
                                Assignment Summary
                            </h2>

                            <p className="mt-3 leading-7 text-gray-600">
                                {analysis.summary}
                            </p>
                        </section>

                        <section className="mt-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                            <h2 className="text-xl font-semibold text-gray-900">
                                Requirements
                            </h2>

                            <ul className="mt-4 list-disc space-y-2 pl-6 text-gray-600">
                                {analysis.requirements.map((requirement, index) => (
                                    <li key={`${index}-${requirement}`}>
                                        {requirement}
                                    </li>
                                ))}
                            </ul>
                        </section>

                        <section className="mt-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                            <h2 className="text-xl font-semibold text-gray-900">
                                Suggested Study Tasks
                            </h2>

                            <p className="mt-2 text-sm text-gray-500">
                                Your saved study plan. Task progress is stored automatically.
                            </p>

                            <div className="mt-4 space-y-3">
                                {analysis.tasks.map((task, index) => (
                                    <div
                                        key={`${index}-${task.title}`}
                                        className="rounded-lg border border-gray-200 p-4"
                                    >
                                        <div className="flex flex-wrap items-start justify-between gap-2">
                                            <h3 className="font-semibold text-gray-800">
                                                {task.title}
                                            </h3>

                                            <span
                                                className={`rounded-full px-3 py-1 text-xs font-medium ${task.priority === 'high'
                                                    ? 'bg-red-100 text-red-700'
                                                    : task.priority === 'medium'
                                                        ? 'bg-amber-100 text-amber-700'
                                                        : 'bg-green-100 text-green-700'
                                                    }`}
                                            >
                                                {task.priority} priority
                                            </span>
                                        </div>

                                        <p className="mt-2 leading-6 text-gray-600">
                                            {task.description}
                                        </p>

                                        <p className="mt-3 text-sm font-medium text-indigo-600">
                                            Estimated time: {task.estimatedHours} hour(s)
                                        </p>
                                        <div className="mt-4 flex items-center gap-3">
                                            <label
                                                htmlFor={`status-${task.id}`}
                                                className="text-sm font-medium text-gray-700"
                                            >
                                                Status:
                                            </label>

                                            <select
                                                id={`status-${task.id}`}
                                                value={task.status || 'not_started'}
                                                onChange={(event) =>
                                                    handleStatusChange(task.id, event.target.value)
                                                }
                                                className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
                                            >
                                                <option value="not_started">Not Started</option>
                                                <option value="in_progress">In Progress</option>
                                                <option value="completed">Completed</option>
                                            </select>
                                        </div>

                                    </div>
                                ))}
                            </div>

                            {analysis.tasks.length > 0 && (
                                <div className="mt-5 border-t border-gray-200 pt-4">
                                    <p className="font-semibold text-gray-800">
                                        Total estimated time:{' '}
                                        {analysis.tasks.reduce(
                                            (total, task) => total + task.estimatedHours,
                                            0
                                        )}{' '}
                                        hours
                                    </p>
                                </div>
                            )}
                        </section>
                    </>
                )}
            </div>
        </main>
    )
}

export default AssignmentAnalysis
