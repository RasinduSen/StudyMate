import { useState } from 'react'

function NewAssignment() {
  const [title, setTitle] = useState('')
  const [brief, setBrief] = useState('')
  const [dueDate, setDueDate] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()

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
          }),
        }
      )

      const data = await response.json()

      console.log(data)
    } catch (error) {
      console.error('Create assignment error:', error)
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

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">

          {/* Assignment Title */}
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

          {/* Assignment Brief */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Assignment Brief
            </label>

            <textarea
              rows="8"
              placeholder="Explain the assignment details here"
              value={brief}
              onChange={(event) => setBrief(event.target.value)}
              className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-indigo-500"
            />
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Due Date
            </label>

            <input
              type="date"
              value={dueDate}
              onChange={(event) => setDueDate(event.target.value)}
              className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-indigo-500"
            />
          </div>

          {/* Submit Button */}
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