const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User_side_effects = sequelize.define('user_side_effects', {
  id_user_side_effect: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  id_side_effect: {
    type: DataTypes.UUID,
    references: {
      model: 'side_effects',
      key: 'id_side_effect',
    },
    allowNull: false,
  },
  id_user: {
    type: DataTypes.UUID,
    references: {
      model: 'users', // Name of the User model (can be adjusted if it's different)
      key: 'id_user', // The primary key of the User model
    },
    allowNull: false,
  },
  date_feel: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  time_feel: {
    type: DataTypes.STRING(10),
    allowNull: true,
  },
  cycle_to: {
    type: DataTypes.INTEGER(3),
    allowNull: false,
  },
  // Tingkat Keparahan (Seberapa parah efek samping tersebut?)
  severity: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      isInt: true,
      min: 1,
      max: 4,
    }
  },
  frekuensi: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      isInt: true,
      min: 1,
      max: 4,
    }
  },
  distress: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      isInt: true,
      min: 1,
      max: 5,
    }
  },
  // masih belum pasti
  note: {
    type: DataTypes.TEXT,
    allowNull: true,
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
},
{
  timestamps: true,  // Automatically manages createdAt and updatedAt
});

module.exports = User_side_effects;
