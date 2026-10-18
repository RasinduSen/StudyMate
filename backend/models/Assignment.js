const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const Assignment = sequelize.define(
  'Assignment',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId:{
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'user_id'
    },

    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    brief: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    dueDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: 'due_date',
    },
  },
  {
    tableName: 'assignments',
    timestamps: true,
    underscored: true,
  }
)

module.exports = Assignment