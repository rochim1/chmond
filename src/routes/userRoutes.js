const express = require('express');
const app = express();
const userController = require('../controllers/userController');
const diagnoseController = require('../controllers/diagnoseController');
const sideEffectController = require('../controllers/sideEffectController');
const educationController = require('../controllers/educationController');
// validator
const userValidator = require('../validations/userValidator');
const loginValidator = require('../validations/loginValidator');
const diagnoseValidator = require('../validations/diagnoseValidator');
const sideEffectValidator = require('../validations/sideEfectValidator');
const educationValidator = require('../validations/educationValidator');

// middleware
const authMiddleware = require('../middlewares/authMiddleware')
const uploadMiddleware = require('../middlewares/uploadMiddleware')

const apiRouter = express.Router();
const api = express.Router();

// User Routes
apiRouter.post('/login', loginValidator, userController.login); // Login user
apiRouter.post('/auth/google', userController.createUserByGoogle); // Authenticate with Google

api.get('/reset/:token', userController.verifyEmail);
api.get('/verify_email/:token', userController.verifyProcess);
apiRouter.post('/auth/lupaPassword', userController.forgotPassword);
apiRouter.post('/auth/verifyEmail/:token', userController.verifyEmail);

apiRouter.post('/users/log_access', authMiddleware, userController.logUserAccess); // Create a new user
// User Route
apiRouter.get('/users', authMiddleware, userController.getAllUsers); // View all user
apiRouter.get('/users/:id_user',authMiddleware, userController.getOneUsers); // View user
apiRouter.post('/users/create', authMiddleware, userValidator, userController.createUser); // Create a new user
apiRouter.put('/users/update/:id_user', authMiddleware, userController.updateUser); // Update a new user
apiRouter.delete('/users/delete/:id_user', authMiddleware, userController.deleteUser); // Delete user

// Diagnose Route
apiRouter.get('/diagnose', authMiddleware, diagnoseController.getAllDiagnoses); // View all user
apiRouter.get('/diagnose/:id_diagnose',authMiddleware, diagnoseController.getOneDiagnose); // View user
apiRouter.post('/diagnose/create', authMiddleware, diagnoseValidator, diagnoseController.createDiagnose); // Create a new user
apiRouter.put('/diagnose/update/:id_diagnose', authMiddleware, diagnoseValidator, diagnoseController.updateDiagnose); // Update a new user
apiRouter.delete('/diagnose/delete/:id_diagnose', authMiddleware, diagnoseController.deleteDiagnose); // Delete user

// Side Effect Route
apiRouter.get('/side_effect', authMiddleware, sideEffectController.getAllSideEffects); // View all user
apiRouter.get('/side_effect/:id_diagnose',authMiddleware, sideEffectController.getOneSideEffect); // View user
apiRouter.post('/side_effect/create', authMiddleware, sideEffectValidator, sideEffectController.createSideEffect); // Create a new user
apiRouter.put('/side_effect/update/:id_diagnose', authMiddleware, sideEffectValidator, sideEffectController.updateSideEffect); // Update a new user
apiRouter.delete('/side_effect/delete/:id_diagnose', authMiddleware, sideEffectController.deleteSideEffect); // Delete user

// Education Route
apiRouter.get('/education', authMiddleware, sideEffectController.getAllSideEffects); // View all user
apiRouter.get('/education/:id_diagnose',authMiddleware, sideEffectController.getOneSideEffect); // View user
apiRouter.post('/education/create', authMiddleware, sideEffectValidator, sideEffectController.createSideEffect); // Create a new user
apiRouter.put('/education/update/:id_diagnose', authMiddleware, sideEffectValidator, sideEffectController.updateSideEffect); // Update a new user
apiRouter.delete('/education/delete/:id_diagnose', authMiddleware, sideEffectController.deleteSideEffect); // Delete user

module.exports =  { apiRouter, api };
