const express = require('express')
const cors = require('cors')
const sequelize = require('./config/database')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('./models/User')
const Assignment = require('./models/Assignment')

User.hasMany(Assignment, {
  foreignKey: 'userId',
})

Assignment.belongsTo(User, {
  foreignKey: 'userId'
})

const app = express()
const PORT = 5000

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader) {
    return res.status(401).json({
      message: 'Access denied. No token provided.',
    })
  }

  const token = authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({
      message: 'Access denied. Invalid token format.',
    })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    req.user = decoded

    next()
  } catch (error) {
    return res.status(401).json({
      message: 'Invalid or expired token.',
    })
  }
}

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
  res.send('StudyMate API is running')
})

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Hello from the StudyMate Express server!',
  })
})

app.post('/api/test', (req, res) => {
  const receivedData = req.body

  console.log('Data received from frontend:', receivedData)

  res.json({
    success: true,
    message: 'Data received successfully',
    data: receivedData,
  })
})

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({
        message: 'Name, email and password are required',
      })
    }

    const existingUser = await User.findOne({
      where: { email },
    })

    if (existingUser) {
      return res.status(409).json({
        message: 'An account with this email already exists',
      })
    }

    const passwordHash = await bcrypt.hash(password, 10)

    const user = await User.create({
      name,
      email,
      passwordHash,
    })

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    })
  } catch (error) {
    console.error('Registration error:', error)

    res.status(500).json({
      message: 'Something went wrong while registering',
    })
  }
})

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        message: 'Email and password are required',
      })
    }

    const user = await User.findOne({
      where: { email },
    })

    if (!user) {
      return res.status(401).json({
        message: 'Invalid email or password',
      })
    }

    const passwordMatches = await bcrypt.compare(
      password,
      user.passwordHash
    )

    if (!passwordMatches) {
      return res.status(401).json({
        message: 'Invalid email or password',
      })
    }
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '1h',
      }
    )
    res.status(200).json({
      message: 'Login successful',
      token: token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    })
  } catch (error) {
    console.error('Login error:', error)

    res.status(500).json({
      message: 'Something went wrong while logging in',
    })
  }
})

app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.userId, {
      attributes: ['id', 'name', 'email'],
    })

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      })
    }

    res.status(200).json({
      user,
    })
  } catch (error) {
    console.error('Get current user error:', error)

    res.status(500).json({
      message: 'Something went wrong',
    })
  }
})

app.post('/api/assignments', authenticateToken, async (req, res) => {
  try {
    const { title, brief, dueDate } = req.body

    if (!title || !brief || !dueDate) {
      return res.status(400).json({
        message: 'Title, brief and due date are required',
      })
    }

    const assignment = await Assignment.create({
      userId: req.user.userId,
      title,
      brief,
      dueDate,
    })

    res.status(201).json({
      message: 'Assignment created successfully',
      assignment,
    })
  } catch (error) {
    console.error('Create assignment error:', error)

    res.status(500).json({
      message: 'Something went wrong while creating the assignment',
    })
  }
})

app.get('/api/assignments', authenticateToken, async (req, res) => {
  try {
    const assignments = await Assignment.findAll({
      where: {
        userId: req.user.userId,
      },
      order: [['dueDate', 'ASC']],
    })

    res.status(200).json({
      assignments,
    })
  } catch (error) {
    console.error('Get assignments error:', error)

    res.status(500).json({
      message: 'Something went wrong while getting assignments',
    })
  }
})

sequelize
  .authenticate()
  .then(() => {
    console.log('Database connected successfully')
    console.log('Connected database:', sequelize.config.database)
    console.log('Registered models:', Object.keys(sequelize.models))

    return sequelize.sync()
  })
  .then(() => {
    console.log('Database tables synchronized')

    app.listen(PORT, () => {
      console.log(`StudyMate server running on http://localhost:${PORT}`)
    })
  })
  .catch((error) => {
    console.error('Unable to connect to the database:', error)
  })