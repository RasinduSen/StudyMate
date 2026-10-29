import { useEffect, useState } from 'react'
import './App.css'
import Dashboard from './pages/Dashboard'
import { Routes, Route } from 'react-router-dom'
import NewAssignment from './pages/NewAssignment'
import EditAssignment from './pages/EditAssignment'
import AssignmentAnalysis from './pages/AssignmentAnalysis'

function App() {
  const [isLogin, setIsLogin] = useState(false)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [user, setUser] = useState(null)

  useEffect(() => {
    const checkLoggedInUser = async () => {
      const token = localStorage.getItem('token')

      if (!token) {
        return
      }

      try {
        const response = await fetch(
          'http://localhost:5000/api/auth/me',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )

        if (!response.ok) {
          localStorage.removeItem('token')
          return
        }

        const data = await response.json()

        setUser(data.user)
      } catch (error) {
        console.error('Authentication check failed:', error)
      }
    }

    checkLoggedInUser()
  }, [])

  // REGISTER
  const handleRegister = async (event) => {
    event.preventDefault()
    setMessage('')
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    try {
      const response = await fetch(
        'http://localhost:5000/api/auth/register',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name,
            email,
            password,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        setError(data.message)
        return
      }

      setMessage(data.message)

      setName('')
      setEmail('')
      setPassword('')
      setConfirmPassword('')
    } catch (error) {
      console.error('Registration error:', error)
      setError('Could not connect to the server')
    }
  }


  // Login
  const handleLogin = async (event) => {
    event.preventDefault()
    setMessage('')
    setError('')

    try {
      const response = await fetch(
        'http://localhost:5000/api/auth/login',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        setError(data.message)
        return
      }

      setMessage(data.message)
      localStorage.setItem('token', data.token)
      setUser(data.user)
      console.log('Logged in user:', data.user)
      setEmail('')
      setPassword('')
    } catch (error) {
      console.error('Login error:', error)
      setError('Could not connect to the server')
    }
  }

  // switching between login and register
  const switchMode = () => {
    setIsLogin((currentMode) => !currentMode)

    setName('')
    setEmail('')
    setPassword('')
    setConfirmPassword('')
    setMessage('')
    setError('')
  }

  if (user) {
    return (
      <Routes>
        <Route
          path="/"
          element={<Dashboard user={user} setUser={setUser} />}
        />

        <Route
          path="/assignments/new"
          element={<NewAssignment />}
        />

        <Route
          path="/assignments/:id/edit"
          element={<EditAssignment />}
        />

        <Route
          path="/assignments/:id/analysis"
          element={<AssignmentAnalysis />}
        />
      </Routes>
    )
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">

      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-md">

        {/* Logo / Title */}

        <h1 className="text-2xl font-bold text-center">
          <span className="text-black">Study</span><span className="text-indigo-600">Mate</span>
        </h1>


        {/* Subtitle */}
        <p className="mt-2 text-center text-gray-600">
          {isLogin ? 'Welcome back' : 'Create your account'}
        </p>

        {/* Form */}
        <form
          onSubmit={isLogin ? handleLogin : handleRegister}
          className="mt-8 space-y-5"
        >

          {/* Full Name - Register only */}
          {!isLogin && (
            <div>
              <label className="mb-2 block font-medium text-gray-700">
                Full Name
              </label>

              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Enter your name"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-indigo-500"
              />
            </div>
          )}

          {/* Email */}
          <div>
            <label className="mb-2 block font-medium text-gray-700">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Enter your email"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-indigo-500"
            />
          </div>

          {/* Password */}
          <div>
            <label className="mb-2 block font-medium text-gray-700">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder={
                isLogin
                  ? 'Enter your password'
                  : 'Create a password'
              }
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-indigo-500"
            />
          </div>

          {/* Confirm Password - Register only */}
          {!isLogin && (
            <div>
              <label className="mb-2 block font-medium text-gray-700">
                Confirm Password
              </label>

              <input
                type="password"
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(event.target.value)
                }
                placeholder="Confirm your password"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-indigo-500"
              />
            </div>
          )}

          {/* Error */}
          {error && (
            <p className="text-center text-sm font-medium text-red-600">
              {error}
            </p>
          )}

          {/* Success */}
          {message && (
            <p className="text-center text-sm font-medium text-green-600">
              {message}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            className="w-full rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-700"
          >
            {isLogin ? 'Log In' : 'Create Account'}
          </button>

        </form>

        {/* Switch Login / Register */}
        <p className="mt-6 text-center text-sm text-gray-600">

          {isLogin
            ? "Don't have an account? "
            : 'Already have an account? '}

          <button
            type="button"
            onClick={switchMode}
            className="font-semibold text-indigo-600 hover:underline"
          >
            {isLogin ? 'Create account' : 'Log in'}
          </button>

        </p>

      </div>
    </div>
  )
}

export default App