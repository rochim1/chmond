const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id_user: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  birthdate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  address: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  gender: {
    type: DataTypes.ENUM('m', 'f'),
    defaultValue: 'm',
    allowNull: false,
  },
  marriage_status: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  last_education: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  stay_with: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  job: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

module.exports = User;
