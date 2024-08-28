const { body } = require('express-validator');

const monitoringLabValidator = [
  body('id_user')
    .isUUID()
    .withMessage('id_user must be a valid UUID'),
  
  body('date_lab')
    .isISO8601()
    .withMessage('date_lab must be a valid date'),

  body('body_weight')
    .optional()  // Optional field
    .isFloat({ min: 0 })
    .withMessage('body_weight must be a positive float'),

  body('body_height')
    .optional()  // Optional field
    .isFloat({ min: 0 })
    .withMessage('body_height must be a positive float'),

  body('hemoglobin')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('hemoglobin must be a positive float'),

  body('leucocytes')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('leucocytes must be a positive float'),

  body('platelets')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('platelets must be a positive float'),

  body('neutrophyle')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('neutrophyle must be a positive float'),

  body('sgot')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('sgot must be a positive float'),

  body('sgpt')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('sgpt must be a positive float'),

  body('bun')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('bun must be a positive float'),

  body('creatinine')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('creatinine must be a positive float'),

  body('glucose')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('glucose must be a positive float'),

  body('amylase')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('amylase must be a positive float'),

  body('Lipase')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Lipase must be a positive float'),

  body('note')
    .optional()
    .isString()
    .withMessage('note must be a string'),

  body('status')
    .optional()
    .isIn(['active', 'deleted'])
    .withMessage('status must be either active or deleted'),
];

module.exports = monitoringLabValidator;
