const UserService = require('../services/userService');
const User = require('../models/userModel'); // Adjust the path to your models if needed
const bcrypt = require('bcryptjs'); // For hashing passwords
const {
  validationResult
} = require('express-validator'); // For request validation
const {
  loginWithGoogle
} = require('../utils/userUtilities')

const getAllUsers = async (req, res) => {
  try {
    const users = await UserService.getAllUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({
      code: "INTERNAL_SERVER_ERROR",
      error: error.message
    });
  }
};

const login = async (req, res) => {
  try {
    // Extract user data from request
    const {
      email,
      password
    } = req.body;

    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array()
      });
    }

    // Find user by email
    const user = await User.findOne({
      where: {
        email
      }
    });
    if (!user) {
      return res.status(400).json({
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        message: 'Invalid email or password'
      });
    }

    // Generate token
    const token = jwt.sign({
      id: user.id_user,
      email: user.email
    }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    // Respond with token
    res.status(200).json({
      message: 'Login successful',
      token
    });
  } catch (error) {
    res.status(500).json({
      code: "INTERNAL_SERVER_ERROR",
      error: error.message
    });
  }
}

// mutation
const createUser = async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        code: 'INVALID_REQUEST',
        errors: errors.array()
      });
    }

    // Extract user data from request
    const {
      email,
      password,
      username,
      name,
      birthdate,
      address,
      phone,
      gender,
      marriage_status,
      last_education,
      stay_with,
      job
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      where: {
        email,
        status: 'active'
      }
    });
    if (existingUser) {
      return res.status(400).json({
        message: 'User already exists'
      });
    }

    // Hash the password
    let hashPassword = encrypt(password, process.env.SALT);

    // Create new user
    const user = await User.create({
      email,
      password: hashPassword,
      username,
      name,
      birthdate,
      address,
      phone,
      gender,
      marriage_status,
      last_education,
      stay_with,
      job,
    });

    // Respond with success
    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: user
    });
  } catch (error) {
    // Handle errors
    console.error('Error creating user:', error);
    res.status(500).json({
      message: 'Internal server error'
    });
  }
};

const createUserByGoogle = async (req, res) => {
  try {
    loginWithGoogle.authenticate('google', {
      scope: ['profile', 'email']
    })(req, res);
  } catch (error) {
    res.status(500).json({
      code: "INTERNAL_SERVER_ERROR",
      error: error.message
    });
  }
}

const editUser = async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array()
      });
    }

    // Extract user data from request
    const {
      id_user
    } = req.params; // User ID from the URL
    const {
      email,
      username,
      name,
      birthdate,
      address,
      phone,
      gender,
      marriage_status,
      last_education,
      stay_with,
      job
    } = req.body;

    // Find the user by ID
    const user = await User.findByPk(id_user);
    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    // Update user details
    await user.update({
      email,
      username,
      name,
      birthdate,
      address,
      phone,
      gender,
      marriage_status,
      last_education,
      stay_with,
      job,
    });

    // Respond with updated user details
    res.status(200).json({
      message: 'User updated successfully',
      user
    });
  } catch (error) {
    // Handle errors
    console.error('Error updating user:', error);
    res.status(500).json({
      message: 'Internal server error'
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    // Extract user ID from request parameters
    const {
      id_user
    } = req.params;

    // Find and delete the user
    const user = await User.findByPk(id_user);
    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    await user.destroy();

    // Respond with a success message
    res.status(200).json({
      message: 'User deleted successfully'
    });
  } catch (error) {
    // Handle errors
    console.error('Error deleting user:', error);
    res.status(500).json({
      message: 'Internal server error'
    });
  }
};

const crypto = require('crypto');

// Encryption function with string salt
function encrypt(text, salt) {
  const algorithm = 'aes-256-cbc';
  const key = crypto.randomBytes(32);  // 32 bytes key for aes-256-cbc
  const iv = crypto.randomBytes(16);   // 16 bytes IV

  // Combine salt with the text
  const saltedText = salt + text;

  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(saltedText, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  return {
    iv: iv.toString('hex'),
    encryptedData: encrypted,
    key: key.toString('hex'),
    salt: salt
  };
}

// Decryption function with string salt
function decrypt(encryptedData, key, iv, salt) {
  const algorithm = 'aes-256-cbc';

  const decipher = crypto.createDecipheriv(algorithm, Buffer.from(key, 'hex'), Buffer.from(iv, 'hex'));
  let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  // Remove the salt from the beginning of the decrypted text
  const originalText = decrypted.slice(salt.length);

  return originalText;
}

module.exports = {
  getAllUsers,
  createUser,
  login,
  createUserByGoogle,
  editUser,
  deleteUser
}