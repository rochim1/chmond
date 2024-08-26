const { body } = require('express-validator');

const monitoringLabValidator = [
  body('id_user')
    .isUUID().withMessage('id_user must be a valid UUID'),
  body('date_lab')
    .isDate().withMessage('date_lab must be a valid date'),
  body('body_weight')
    .optional().isFloat().withMessage('body_weight must be a number'),
  body('body_height')
    .optional().isFloat().withMessage('body_height must be a number'),
  body('hemoglobin')
    .optional().isFloat().withMessage('hemoglobin must be a number'),
  body('leucocytes')
    .optional().isFloat().withMessage('leucocytes must be a number'),
  body('platelets')
    .optional().isFloat().withMessage('platelets must be a number'),
  body('neutrophyle')
    .optional().isFloat().withMessage('neutrophyle must be a number'),
  body('sgot')
    .optional().isFloat().withMessage('sgot must be a number'),
  body('sgpt')
    .optional().isFloat().withMessage('sgpt must be a number'),
  body('bun')
    .optional().isFloat().withMessage('bun must be a number'),
  body('creatinine')
    .optional().isFloat().withMessage('creatinine must be a number'),
  body('glucose')
    .optional().isFloat().withMessage('glucose must be a number'),
  body('amylase')
    .optional().isFloat().withMessage('amylase must be a number'),
  body('Lipase')
    .optional().isFloat().withMessage('Lipase must be a number'),
  body('note')
    .optional().isString().withMessage('note must be a string'),
  body('status')
    .optional().isIn(['active', 'deleted']).withMessage('status must be either "active" or "deleted"'),
];

module.exports = monitoringLabValidator;
