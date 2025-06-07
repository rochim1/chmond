const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const { decrypt } = require('../utils/userUtilities'); // pastikan decrypt ini di-import ya

const Users = sequelize.define('users', {
  id_user: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  username: {
    type: DataTypes.STRING(25),
    unique: true,
    allowNull: true,
  },
  name: {
    type: DataTypes.STRING(50),
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
    type: DataTypes.STRING(16),
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
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  stay_with: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  job: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('active', 'deleted'),
    defaultValue: 'active',
    allowNull: true,
  },
  body_weight: {
    type: DataTypes.STRING(10),
    allowNull: true,
  },
  body_height: {
    type: DataTypes.STRING(10),
    allowNull: true,
  },
  resetPasswordToken: {
    type: DataTypes.STRING(150),
    allowNull: true,
  },
  fcm_token: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  role: {
    type: DataTypes.ENUM('user', 'admin'),
    defaultValue: 'user',
    allowNull: true,
  },
  email_verified_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  deletedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  }
}, {
  timestamps: true,
  paranoid: true, // ini kalau kamu mau support soft delete (deletedAt otomatis dipakai)
  tableName: 'users'
});

// ✅ FIX: pasang hook ke "Users" (bukan User)
Users.addHook('afterFind', (findResult) => {
  if (!findResult) return;
  const decryptPassword = (user) => {
    if (user.password && typeof user.password === "string") {
      try {
        user.password = decrypt(user.password, process.env.SALT);
      } catch (err) {
        console.error("Failed to decrypt password for user ID:", user.id_user, err.message);
        user.password = null;
      }
    }
  };

  if (Array.isArray(findResult)) {
    findResult.forEach(user => decryptPassword(user));
  } else {
    decryptPassword(findResult);
  }
});

module.exports = Users;
