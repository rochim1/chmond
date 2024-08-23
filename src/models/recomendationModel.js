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
    references: {
      model: 'Side_effects', // Name of the User model (can be adjusted if it's different)
      key: 'id_side_effect', // The primary key of the User model
    },
    allowNull: false,
  },
  id_education: {
    type: DataTypes.UUID,
    references: {
      model: 'Educations', // Name of the User model (can be adjusted if it's different)
      key: 'id_education', // The primary key of the User model
    },
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
},
{
  timestamps: true,  // Automatically manages createdAt and updatedAt
});

module.exports = Recomendation;
