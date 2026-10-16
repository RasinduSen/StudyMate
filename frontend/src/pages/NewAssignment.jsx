import { useState } from 'react'

function NewAssignment() {
    const [title, setTitle] = useState('')
    const [brief, setBrief] = useState('')
    const [dueDate, setDueDate] = useState('')
    const handleSubmit = (event) => {
        event.preventDefault()

        console.log({
            title,
            brief,
            dueDate,
        })
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
                <form onSubmit={handleSubmit} className="mt-8 space-y-6">

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Assignment Title
                        </label>

                        <input
                            type="text"
                            placeholder="e.g. Software Engineering Report"
                            value={title}
                            onChange={(event) => setTitle(event.target.value)}
                            className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-indigo-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Assignment brief
                        </label>

                        <textarea
                            rows="8"
                            placeholder="Explain the assignment details here"
                            value={brief}
                            onChange={(event) => setBrief(event.target.value)}
                            className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-indigo-500"
                        />
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Due date
                            </label>

                            <input
                                type="date"
                                placeholder="blah blah blah"
                                value={dueDate}
                                onChange={(event) => setDueDate(event.target.value)}
                                className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-indigo-500"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full rounded-lg bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-700"
                    >
                        Create Assignment
                    </button>
                </form>

            </main>
        </div>
    )
}

export default NewAssignment