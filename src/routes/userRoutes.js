const express = require('express');
const app = express();
const userController = require('../controllers/userController');

const userValidator = require('../validations/userValidator');
const loginValidator = require('../validations/loginValidator');
// const router = express.Router();

const apiRouter = express.Router();
apiRouter.get('/users', userController.getAllUsers);

apiRouter.post('/users/log_access', userController.logUserAccess); // Create a new user

// User Routes
apiRouter.post('/login', loginValidator, userController.login); // Login user
apiRouter.post('/auth/google', userController.createUserByGoogle); // Authenticate with Google

apiRouter.get('/users', userController.getAllUsers); // View all user
apiRouter.get('/users/:id_user', userController.getOneUsers); // View user
apiRouter.post('/users/create', userValidator, userController.createUser); // Create a new user
apiRouter.put('/users/update/:id_user', userController.updateUser); // Update a new user
apiRouter.delete('/users/delete/:id_user', userController.deleteUser); // Delete user

app.use('/api', apiRouter);

module.exports = apiRouter;
