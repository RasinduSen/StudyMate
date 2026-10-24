
const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const StudyTask = sequelize.define(
  'StudyTask',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    aiStudyPlanId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'ai_study_plan_id',
    },

    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    estimatedHours: {
      type: DataTypes.FLOAT,
      allowNull: false,
      field: 'estimated_hours',
    },

    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high'),
      allowNull: false,
    },

    status: {
      type: DataTypes.ENUM(
        'not_started',
        'in_progress',
        'completed'
      ),
      allowNull: false,
      defaultValue: 'not_started',
    },
  },
  {
    tableName: 'study_tasks',
    timestamps: true,
    underscored: true,
  }
)

module.exports = StudyTask
