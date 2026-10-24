import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'


function Dashboard({ user, setUser }) {

  const handleLogout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }
  const [assignments, setAssignments] = useState([])
  const [deletingId, setDeletingId] = useState(null)
  const [deleteError, setDeleteError] = useState('')

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const token = localStorage.getItem('token')

        const response = await fetch(
          'http://localhost:5000/api/assignments',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )

        const data = await response.json()

        if (!response.ok) {
          console.error(data.message)
          return
        }

        setAssignments(data.assignments)
      } catch (error) {
        console.error('Get assignments error:', error)
      }
    }

    fetchAssignments()
  }, [])

  const handleDelete = async (assignment) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${assignment.title}"?`
    )

    if (!confirmed) return

    setDeletingId(assignment.id)
    setDeleteError('')

    try {
      const token = localStorage.getItem('token')

      const response = await fetch(
        `http://localhost:5000/api/assignments/${assignment.id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete assignment.')
      }

      setAssignments((currentAssignments) =>
        currentAssignments.filter((item) => item.id !== assignment.id)
      )
    } catch (error) {
      console.error('Delete assignment error:', error)
      setDeleteError(error.message || 'Could not delete the assignment.')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="min-h-screen bg-slate-100">

      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">

          <h1 className="text-2xl font-bold text-indigo-600">
            StudyMate
          </h1>

          <button
            onClick={handleLogout}
            className="rounded-lg px-4 py-2 font-medium text-gray-600 hover:bg-gray-100"
          >
            Logout
          </button>

        </div>
      </nav>

      {/* Main content */}
      <main className="mx-auto max-w-6xl px-6 py-10">

        <h2 className="text-3xl font-bold text-gray-900">
          Welcome back, {user.name}
        </h2>

        <p className="mt-2 text-gray-600">
          Let's get your assignments under control.
        </p>

        {/* Assignments heading */}
        <div className="mt-10 flex items-center justify-between">

          <h3 className="text-xl font-semibold text-gray-900">
            Your Assignments
          </h3>

          <Link
            to="/assignments/new"
            className="rounded-lg bg-indigo-600 px-5 py-2.5 font-semibold text-white hover:bg-indigo-700"
          >
            + New Assignment
          </Link>
        </div>

        {deleteError && (
          <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {deleteError}
          </p>
        )}

        {/* Empty state */}
        {assignments.length === 0 ? (
          <div className="mt-6 rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center">
            <h4 className="text-lg font-semibold text-gray-800">
              No assignments yet
            </h4>

            <p className="mt-2 text-gray-500">
              Create your first assignment and let StudyMate build your plan.
            </p>
          </div>
        ) : (
          <div className="mt-6 grid gap-4">
            {assignments.map((assignment) => (
              <div
                key={assignment.id}
                className="rounded-xl bg-white p-6 shadow-sm border border-gray-200"
              >
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                  <div className="min-w-0 flex-1">
                    <h4 className="text-lg font-semibold text-gray-900">
                      {assignment.title}
                    </h4>

                    <p className="mt-2 text-gray-600">
                      {assignment.brief}
                    </p>

                    <p className="mt-4 text-sm font-medium text-indigo-600">
                      Due: {assignment.dueDate}
                    </p>
                  </div>

                  <Link
                    to={`/assignments/${assignment.id}/edit`}
                    className="self-start rounded-lg border border-indigo-200 px-4 py-2 font-medium text-indigo-600 hover:bg-indigo-50"
                  >
                    Edit
                  </Link>

                  <Link
                    to={`/assignments/${assignment.id}/analysis`}
                    className="self-start rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700"
                  >
                    ✨ Analyse with AI
                  </Link>

                  <button
                    onClick={() => handleDelete(assignment)}
                    disabled={deletingId === assignment.id}
                    className="self-start rounded-lg border border-red-200 px-4 py-2 font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                  >
                    {deletingId === assignment.id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </main>

    </div>
  )
}

export default Dashboard