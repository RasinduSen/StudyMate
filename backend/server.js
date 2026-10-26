const express = require('express')
const cors = require('cors')
const sequelize = require('./config/database')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('./models/User')
const Assignment = require('./models/Assignment')
const analyzeAssignment = require('./ai/geminiService')
const AIStudyPlan = require('./models/AIStudyPlan')
const StudyTask = require('./models/StudyTask')

User.hasMany(Assignment, {
  foreignKey: 'userId',
})

Assignment.belongsTo(User, {
  foreignKey: 'userId'
})

Assignment.hasOne(AIStudyPlan, {
  foreignKey: 'assignmentId',
  onDelete: 'CASCADE',
})

AIStudyPlan.belongsTo(Assignment, {
  foreignKey: 'assignmentId',
})

AIStudyPlan.hasMany(StudyTask, {
  foreignKey: 'aiStudyPlanId',
  onDelete: 'CASCADE',
})

StudyTask.belongsTo(AIStudyPlan, {
  foreignKey: 'aiStudyPlanId',
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
    const { title, brief, dueDate, dueTime } = req.body

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
      dueTime: dueTime || '00:00',
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


app.delete('/api/assignments/:id', authenticateToken, async (req, res) => {
  try {
    const assignmentId = Number(req.params.id)

    if (!Number.isInteger(assignmentId) || assignmentId <= 0) {
      return res.status(400).json({
        message: 'Invalid assignment ID',
      })
    }

    const deletedCount = await Assignment.destroy({
      where: {
        id: assignmentId,
        userId: req.user.userId,
      },
    })

    if (deletedCount === 0) {
      return res.status(404).json({
        message: 'Assignment not found',
      })
    }

    return res.status(200).json({
      message: 'Assignment deleted successfully',
    })
  } catch (error) {
    console.error('Delete assignment error:', error)

    return res.status(500).json({
      message: 'Something went wrong while deleting the assignment',
    })
  }
})

app.get(
  '/api/assignments/:id/study-plan',
  authenticateToken,
  async (req, res) => {
    try {
      const assignmentId = Number(req.params.id)

      if (!Number.isInteger(assignmentId) || assignmentId <= 0) {
        return res.status(400).json({
          message: 'Invalid assignment ID',
        })
      }

      const assignment = await Assignment.findOne({
        where: {
          id: assignmentId,
          userId: req.user.userId,
        },
      })

      if (!assignment) {
        return res.status(404).json({
          message: 'Assignment not found',
        })
      }

      const plan = await AIStudyPlan.findOne({
        where: {
          assignmentId: assignment.id,
        },
        include: [
          {
            model: StudyTask,
          },
        ],
      })

      if (!plan) {
        return res.status(404).json({
          message: 'No saved study plan found',
        })
      }

      res.status(200).json({
        studyPlan: {
          summary: plan.summary,
          requirements: plan.requirements,
          tasks: plan.StudyTasks.map((task) => ({
            id: task.id,
            title: task.title,
            description: task.description,
            estimatedHours: task.estimatedHours,
            priority: task.priority,
            status: task.status,
          })),
        },
      })
    } catch (error) {
      console.error('Get study plan error:', error)

      res.status(500).json({
        message: 'Unable to load the saved study plan',
      })
    }
  }
)

app.post(
  '/api/assignments/:id/analyze',
  authenticateToken,
  async (req, res) => {
    console.log('Analyze route reached. Assignment ID:', req.params.id)
    const assignmentId = Number(req.params.id)

    if (!Number.isInteger(assignmentId) || assignmentId <= 0) {
      return res.status(400).json({
        message: 'Invalid assignment ID',
      })
    }

    try {
      // Find the assignment only if it belongs to the logged-in user.
      const assignment = await Assignment.findOne({
        where: {
          id: assignmentId,
          userId: req.user.userId,
        },
      })

      if (!assignment) {
        return res.status(404).json({
          message: 'Assignment not found',
        })
      }

      // Ask Gemini to analyse the saved assignment.
      const analysis = await analyzeAssignment({
        title: assignment.title,
        brief: assignment.brief,
        dueDate: assignment.dueDate,
      })

      const existingPlan = await AIStudyPlan.findOne({
        where: {
          assignmentId: assignment.id,
        },
      })

      if (existingPlan) {
        await StudyTask.destroy({
          where: {
            aiStudyPlanId: existingPlan.id,
          },
        })

        await existingPlan.update({
          summary: analysis.summary,
          requirements: analysis.requirements,
        })

        for (const task of analysis.tasks) {
          await StudyTask.create({
            aiStudyPlanId: existingPlan.id,
            title: task.title,
            description: task.description,
            estimatedHours: task.estimatedHours,
            priority: task.priority,
          })
        }
      } else {
        const newPlan = await AIStudyPlan.create({
          assignmentId: assignment.id,
          summary: analysis.summary,
          requirements: analysis.requirements,
        })

        for (const task of analysis.tasks) {
          await StudyTask.create({
            aiStudyPlanId: newPlan.id,
            title: task.title,
            description: task.description,
            estimatedHours: task.estimatedHours,
            priority: task.priority,
          })
        }
      }

      res.status(200).json({
        message: 'Assignment analyzed successfully',
        assignmentId: assignment.id,
        analysis,
      })
    } catch (error) {
      console.error('Analyze assignment error:', error)

      res.status(502).json({
        message:
          'Unable to analyze this assignment right now. Please try again later.',
      })
    }
  }
)

app.put('/api/study-tasks/:id/status', authenticateToken, async (req, res) => {
  try {
    const taskId = Number(req.params.id)
    const { status } = req.body

    const allowedStatuses = [
      'not_started',
      'in_progress',
      'completed',
      'couldnt_complete',
    ]

    if (!Number.isInteger(taskId) || taskId <= 0) {
      return res.status(400).json({
        message: 'Invalid task ID',
      })
    }

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: 'Invalid task status',
      })
    }

    const task = await StudyTask.findByPk(taskId, {
      include: {
        model: AIStudyPlan,
        include: {
          model: Assignment,
          where: {
            userId: req.user.userId,
          },
        },
      },
    })

    if (!task) {
      return res.status(404).json({
        message: 'Study task not found',
      })
    }

    task.status = status
    await task.save()

    res.status(200).json({
      message: 'Task status updated successfully',
      task,
    })
  } catch (error) {
    console.error('Update task status error:', error)

    res.status(500).json({
      message: 'Something went wrong while updating the task',
    })
  }
})

app.put('/api/assignments/:id', authenticateToken, async (req, res) => {
  try {
    const assignmentId = Number(req.params.id)
    const { title, brief, dueDate, dueTime } = req.body

    if (!Number.isInteger(assignmentId) || assignmentId <= 0) {
      return res.status(400).json({
        message: 'Invalid assignment ID',
      })
    }

    if (!title || !brief || !dueDate) {
      return res.status(400).json({
        message: 'Title, brief and due date are required',
      })
    }

    const assignment = await Assignment.findOne({
      where: {
        id: assignmentId,
        userId: req.user.userId,
      },
    })

    if (!assignment) {
      return res.status(404).json({
        message: 'Assignment not found',
      })
    }

    assignment.title = title
    assignment.brief = brief
    assignment.dueDate = dueDate
    assignment.dueTime = dueTime || '00:00'

    await assignment.save()

    res.status(200).json({
      message: 'Assignment updated successfully',
      assignment,
    })
  } catch (error) {
    console.error('Update assignment error:', error)

    res.status(500).json({
      message: 'Something went wrong while updating the assignment',
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