const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Diagnose = sequelize.define('Diagnose', {
  id_rekomendasi: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  id_side_effect: {
    type: DataTypes.UUID,
    references: {
      model: 'Side_effects', // Name of the User model (can be adjusted if it's different)
      key: 'id_side_effect', // The primary key of the User model
    },
    allowNull: false,
  },
  id_education: {
    type: DataTypes.UUID,
    references: {
      model: 'Diagnose', // Name of the User model (can be adjusted if it's different)
      key: 'id_diagnose', // The primary key of the User model
    },
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('active', 'deleted'),
    defaultValue: 'active',
    allowNull: true,
  },
  deleted_at: {
    type: DataTypes.DATE,
    allowNull: true,
  }
});

module.exports = Diagnose;
