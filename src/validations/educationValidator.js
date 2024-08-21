const {
  body
} = require('express-validator');
const Educations = require('../models/educationModel'); // Import the Educations model

const educationValidatorCreate = [
  body('title')
  .notEmpty().withMessage('Title is required')
  .isString().withMessage('Title must be a string')
  .isLength({
    max: 200
  }).withMessage('Title can be at most 200 characters long')
  .custom(async (value) => {
    // Check for uniqueness in the Educations table
    const education = await Educations.findOne({
      where: {
        title: value
      }
    });
    if (education) {
      throw new Error('Title must be unique');
    }
    return true;
  }),

  body('content')
  .optional()
  .isString().withMessage('Content must be a string'),

  body('video_link')
  .optional()
  .isURL().withMessage('Video link must be a valid URL')
  .isLength({
    max: 150
  }).withMessage('Video link can be at most 150 characters long'),

  // Thumbnail is handled by multer, so no need to validate it here
  // Multer will manage file types and sizes.
];

const educationValidatorUpdate = [
  body('title')
  .notEmpty().withMessage('Title is required')
  .isString().withMessage('Title must be a string')
  .isLength({
    max: 200
  }).withMessage('Title can be at most 200 characters long'),

  body('content')
  .optional()
  .isString().withMessage('Content must be a string'),

  body('video_link')
  .optional()
  .isURL().withMessage('Video link must be a valid URL')
  .isLength({
    max: 150
  }).withMessage('Video link can be at most 150 characters long'),

  // Thumbnail is handled by multer, so no need to validate it here
  // Multer will manage file types and sizes.
];

module.exports = {
  educationValidatorCreate,
  educationValidatorUpdate
}