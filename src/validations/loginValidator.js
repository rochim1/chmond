const {
  check,
  validationResult
} = require('express-validator');

// Validation rules for the fields
const validateUser = [
  // require
  check('email')
  .isEmail().withMessage('Please enter a valid email address')
  .notEmpty().withMessage('Email is required'),
  check('password').isLength({
    min: 6
  }).withMessage('Password must be at least 6 characters long'),
];

module.exports = validateUser;