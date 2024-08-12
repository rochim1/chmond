const { check, validationResult } = require('express-validator');

// Validation rules for the fields
const validateUser = [
  // require
  check('email').isEmail().withMessage('Invalid email address'),
  check('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  check('username').notEmpty().withMessage('Username is required'),
  
  // not require (.optional())
  // check('name').notEmpty().withMessage('Name is required'),
  check('birthdate').optional().isDate().withMessage('Invalid birthdate'),
  // check('address').notEmpty().withMessage('Address is required'),
  check('phone').optional().isMobilePhone().withMessage('Invalid phone number'),
  check('gender').optional().isIn(['m', 'f']).withMessage('Invalid gender'),
  check('marriage_status').optional().isBoolean().withMessage('Marriage status must be a boolean value'),
  // check('last_education').notEmpty().withMessage('Last education is required'),
  // check('stay_with').notEmpty().withMessage('Stay with is required'),
  // check('job').notEmpty().withMessage('Job is required')
];

module.exports = validateUser;
