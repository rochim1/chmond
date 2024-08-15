const UserService = require('../services/userService');
const User = require('../models/userModel'); // Adjust the path to your models if needed
const UserLogAccessModel = require('../models/userLogAccessModel'); // Adjust the path to your models if needed
const bcrypt = require('bcryptjs'); // For hashing passwords
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { sendEmailFunction } = require('../mail_templates/index');

const {
  validationResult
} = require('express-validator'); // For request validation
const {
  loginWithGoogle
} = require('../utils/userUtilities')
const jwt = require('jsonwebtoken');

const getOneUsers = async (req, res) => {
  try {

    const {
      id_user
    } = req.params;

    if (!id_user) {
      res.status(400).json({
        success: false,
        code: "BAD_REQUEST",
        error: "can't get id_user"
      });
    }

    const user = await User.findOne({
      where: {
        id_user,
        status: 'active'
      }
    });

    if (!user) {
      res.status(404).json({
        success: false,
        code: "NOT_FOUND",
        error: 'user not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'INTERNAL_SERVER_ERROR',
      error: error.message
    });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const {
      page = 1, pageSize = 10
    } = req.body;
    const {
      status
    } = req.body && req.body.filter ? req.body.filter : {
      status: 'active'
    };
    console.log(status)
    const offset = (page - 1) * pageSize;
    const limit = parseInt(pageSize);

    const users = await User.findAndCountAll({
      where: {
        status
      },
      offset,
      limit
    });

    res.status(200).json({
      success: true,
      totalItems: users.count,
      totalPages: Math.ceil(users.count / pageSize),
      currentPage: parseInt(page),
      users: users.rows
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      code: 'INTERNAL_SERVER_ERROR',
      error: error.message
    });
  }
};

const logUserAccess = async (req, res) => {
  try {
    const {
      id_user,
      datetime,
      access_via
    } = req.body;
    let userAccess = await UserLogAccessModel.create({
      id_user,
      datetime,
      access_via
    })

    return res.status(200).json({
      success: true,
      data: userAccess
    });

  } catch (error) {
    res.status(500).json({
      success: false,
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
      password,
      infinite_token,
      remember_me
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
        email,
        status: "active"
      }
    });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check password
    let isMatch = false;
    if (password == decrypt(user.password, process.env.SALT)) {
      isMatch = true;
    }
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    let token;
    if (infinite_token) {
      // Generate token
      token = jwt.sign({
          id: user.id_user,
          email: user.email
        },
        process.env.JWT_SECRET
        // { expiresIn: '1h' } // Adjust expiration time as necessary
      );
    } else if (remember_me) {
      token = jwt.sign({
          id: user.id_user,
          email: user.email
        },
        process.env.JWT_SECRET, {
          expiresIn: '30d'
        } // Adjust expiration time as necessary
      );
    } else {
      token = jwt.sign({
          id: user.id_user,
          email: user.email
        },
        process.env.JWT_SECRET, {
          expiresIn: '1h'
        } // Adjust expiration time as necessary
      );
    }

    // Respond with token
    res.status(200).json({
      success: true,
      message: 'Login successful',
      infinite_token,
      remember_me,
      token,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'INTERNAL_SERVER_ERROR',
      error: error.message
    });
  }
};

// mutation
const createUser = async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        code: 'BAD_REQUEST',
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
      job,
      body_weight,
      body_height
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
      body_weight,
      body_height
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
      success: false,
      message: 'INTERNAL_SERVER_ERROR',
      error: error.message
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
      success: false,
      message: 'INTERNAL_SERVER_ERROR',
      error: error.message
    });
  }
}

const updateUser = async (req, res) => {
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

    // Find the user by ID
    const user = await User.findOne({
      where: {
        id_user,
        status: 'active'
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        code: "NOT_FOUND",
        message: 'User not found'
      });
    }

    if (password) {
      password = encrypt(password, process.env.SALT)
    }
    // Update user details
    await user.update({
      email,
      username,
      name,
      password,
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
      success: true,
      message: 'User updated successfully',
      data: user
    });
  } catch (error) {
    // Handle errors
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      message: 'INTERNAL_SERVER_ERROR',
      error: error.message
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
    const user = await User.findOne({
      where: {
        id_user,
        status: 'active'
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        code: "NOT_FOUND",
        message: 'User not found'
      });
    }

    await user.update({
      status: 'deleted'
    });

    // Respond with a success message
    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
      data: user.status
    });
  } catch (error) {
    // Handle errors
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: 'INTERNAL_SERVER_ERROR',
      error: error.message
    });
  }
};

const forgotPassword = async (req, res) => {
  try {
      const { email } = req.body;

      // Call sendEmailFunction
      const emailResponse = await sendEmailFunction(
          email, 
          'forgot_password', 
          {}, // params are dynamically added inside the function
          'ind' // or 'eng' for English template
      );

      if (!emailResponse.success) {
          return res.status(emailResponse.code ? emailResponse.code : 400).json(emailResponse);
      }

      return res.status(200).json({
          success: true,
          message: 'Password reset email sent successfully',
      });
  } catch (error) {
      console.error('Error sending forgot password email:', error);
      return res.status(500).json({
          success: false,
          message: 'INTERNAL_SERVER_ERROR',
          error: error.message,
      });
  }
};


// Encryption function using salt as the key
function encrypt(text, salt) {
  const algorithm = 'aes-256-cbc';
  const key = crypto.createHash('sha256').update(salt).digest(); // Derive key from salt
  const iv = Buffer.alloc(16, 0); // Use a fixed IV (not secure, but simple for this use case)

  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  return encrypted;
}

// Decryption function with string salt as the key
function decrypt(encryptedText, salt) {
  const algorithm = 'aes-256-cbc';
  const key = crypto.createHash('sha256').update(salt).digest(); // Derive key from salt
  const iv = Buffer.alloc(16, 0); // Use the same fixed IV as in encryption

  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

module.exports = {
  logUserAccess,
  getAllUsers,
  createUser,
  login,
  createUserByGoogle,
  updateUser,
  deleteUser,
  getOneUsers,
  forgotPassword
}