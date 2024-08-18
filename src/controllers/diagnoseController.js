const UsersService = require('../services/userService');
const User = require('../models/userModel'); // Adjust the path to your models if needed
const Diagnose = require('../models/diagnoseModel'); // Adjust the path to your models if needed
const UserLogAccessModel = require('../models/userLogAccessModel'); // Adjust the path to your models if needed
const bcrypt = require('bcryptjs'); // For hashing passwords
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const {
  sendEmailFunction
} = require('../mail_templates/index');

const {
  validationResult
} = require('express-validator'); // For request validation
const {
  loginWithGoogle
} = require('../utils/userUtilities')
const jwt = require('jsonwebtoken');



// mutation
const createDiagnose = async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        code: 'BAD_REQUEST',
        error: {
          message: errors.array()
        }
      });
    }

    // Extract user data from request
    const {
      diagnose,
      stage,
      siklus,
      period,
      diagnose_date,
      kemo_start_date,
      responsible_doctor,
      id_user,
    } = req.body;

    // Create new user
    const user = await User.create({
      diagnose,
      stage,
      siklus,
      period,
      diagnose_date,
      kemo_start_date,
      responsible_doctor,
      id_user,
    });

    // Respond with success
    res.status(201).json({
      success: true,
      message: 'Diagnose created successfully',
      data: user
    });
  } catch (error) {
    // Handle errors
    console.error('Error creating diagnose:', error);
    res.status(500).json({
      success: false,
      message: 'INTERNAL_SERVER_ERROR',
      error: {
        message: error.message
      }
    });
  }
};

module.exports = {
  createDiagnose
}