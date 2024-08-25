const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Recomendation = sequelize.define('Recomendation', {
  id_rekomendasi: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  id_side_effect: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  id_education: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('active', 'deleted'),
    defaultValue: 'active',
    allowNull: true,
  },
  deletedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  }
}, {
  timestamps: true,
});

module.exports = Recomendation;
