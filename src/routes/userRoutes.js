const express = require('express');
const app = express();
const userController = require('../controllers/userController');
// validator
const userValidator = require('../validations/userValidator');
const loginValidator = require('../validations/loginValidator');

// middleware
const authMiddleware = require('../middlewares/authMiddleware')

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
apiRouter.get('/users', userController.getAllUsers);
apiRouter.get('/users', authMiddleware, userController.getAllUsers); // View all user
apiRouter.get('/users/:id_user',authMiddleware, userController.getOneUsers); // View user
apiRouter.post('/users/create', userValidator, userController.createUser); // Create a new user
apiRouter.put('/users/update/:id_user', authMiddleware, userController.updateUser); // Update a new user
apiRouter.delete('/users/delete/:id_user', authMiddleware, userController.deleteUser); // Delete user

module.exports =  { apiRouter, api };
