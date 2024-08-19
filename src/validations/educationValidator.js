const { body } = require('express-validator');

const createEducationValidator = [
  body('title')
    .isLength({ max: 200 })
    .withMessage('Title can be at most 200 characters long.')
    .optional(),
  body('video_link')
    .isLength({ max: 150 })
    .withMessage('Video link can be at most 150 characters long.')
    .optional(),
  body('thumbnail')
    .isLength({ max: 150 })
    .withMessage('Thumbnail link can be at most 150 characters long.')
    .optional(),
];

module.exports = {
    createEducationValidator
}