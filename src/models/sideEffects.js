const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Side_effects = sequelize.define('Side_effects', {
  id_side_effect: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  effect_name: {
    type: DataTypes.STRING(200),
    allowNull: true,
  },
  effect_detail: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('active', 'deleted'),
    defaultValue: 'active',
    allowNull: true,
  },
});

module.exports = Side_effects;
