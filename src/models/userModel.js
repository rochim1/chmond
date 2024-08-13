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
    unique: true, // This ensures the email must be unique
    validate: {
      isEmail: true // Optional: Validates that the input is in email format
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  username: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  birthdate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  address: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  gender: {
    type: DataTypes.ENUM('m', 'f'),
    defaultValue: 'm',
    allowNull: true,
  },
  marriage_status: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  last_education: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  stay_with: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  job: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('active', 'deleted'),
    defaultValue: 'active',
    allowNull: true,
  }
});

module.exports = User;
