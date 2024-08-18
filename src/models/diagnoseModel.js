const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Diagnose = sequelize.define('Diagnose', {
  id_diagnose: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  diagnose: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  stage: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  siklus: {
    type: DataTypes.STRING(200),
    allowNull: true,
  },
  period: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  diagnose_date: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  kemo_start_date: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  responsible_doctor: {
    type: DataTypes.STRING(70),
    allowNull: true,
  },
  id_user: {
    type: DataTypes.UUID,
    references: {
      model: 'users', // Name of the User model (can be adjusted if it's different)
      key: 'id_user', // The primary key of the User model
    },
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('active', 'deleted'),
    defaultValue: 'active',
    allowNull: true,
  },
});

module.exports = Diagnose;
