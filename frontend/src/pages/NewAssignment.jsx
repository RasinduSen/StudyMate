function NewAssignment() {
    return (
        <div className="min-h-screen bg-slate-100">
            <main className="mx-auto max-w-3xl px-6 py-10">

                <h1 className="text-3xl font-bold text-gray-900">
                    Create Assignment
                </h1>

                <p className="mt-2 text-gray-600">
                    Add your assignment details and StudyMate will help you plan it.
                </p>
                <form className="mt-8 space-y-6">

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Assignment Title
                        </label>

                        <input
                            type="text"
                            placeholder="e.g. Software Engineering Report"
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
                            className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-indigo-500"
                        />
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Due date
                            </label>

                            <input
                                type="date"
                                placeholder="blah blah blah"
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