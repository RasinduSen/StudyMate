
const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const AIStudyPlan = sequelize.define(
    'AIStudyPlan',
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        assignmentId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true,
            field: 'assignment_id',
        },
        summary: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        requirements: {
            type: DataTypes.JSON,
            allowNull: false,
        },
        adaptationExplanation: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: 'adaptation_explanation',
        },
    },
    {
        tableName: 'ai_study_plans',
        timestamps: true,
        underscored: true,
    }
)

module.exports = AIStudyPlan
