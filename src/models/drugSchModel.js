const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./userModel');

const DrugSchedule = sequelize.define('Drug_schedule', {
  id_chemoSchedule: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  tujuan_kemoterapi: {
    type: DataTypes.STRING(150),
    allowNull: false,
  },
  tanggal_kemoterapi: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  waktu_kemoterapi: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  remember_before_minutes: {  // Fixed typo in the field name
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  notes: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  id_user: {
    type: DataTypes.UUID,
    references: {
      model: User,
      key: 'id_user',
    },
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('active', 'deleted'),
    defaultValue: 'active',
  },
  deletedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  timestamps: true,  // Automatically manages createdAt and updatedAt
});

module.exports = DrugSchedule;
