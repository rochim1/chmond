const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const user_log_access = sequelize.define('user_log_access', {
  id_log: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  id_user: {
    type: DataTypes.UUID,
    references: {
      model: 'users', // Name of the User model (can be adjusted if it's different)
      key: 'id_user', // The primary key of the User model
    },
    allowNull: false,
  },
  datetime: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  access_via: {
    type: DataTypes.STRING,
    allowNull: true,
  },
},
{
  timestamps: true,  // Automatically manages createdAt and updatedAt
});

module.exports = user_log_access;
