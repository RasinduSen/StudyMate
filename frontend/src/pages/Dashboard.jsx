import { Link } from 'react-router-dom'

function Dashboard({ user, setUser }) {

  const handleLogout = () => {
    localStorage.removeItem('token')
    setUser(null)
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

        {/* Empty state */}
        <div className="mt-6 rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center">

          <h4 className="text-lg font-semibold text-gray-800">
            No assignments yet
          </h4>

          <p className="mt-2 text-gray-500">
            Create your first assignment and let StudyMate build your plan.
          </p>

        </div>

      </main>

    </div>
  )
}

export default Dashboard