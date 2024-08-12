const express = require('express');
const app = express();
const userController = require('../controllers/userController');

const userValidator = require('../validations/userValidator');
// const router = express.Router();

const apiRouter = express.Router();
apiRouter.get('/users', userController.getAllUsers);


// User Routes
apiRouter.post('/users/create', userValidator, userController.createUser); // Create a new user
apiRouter.post('/auth/google', userController.createUserByGoogle); // Authenticate with Google
apiRouter.post('/login', userController.login); // Login user
apiRouter.put('/users/:id_user', userController.editUser); // Edit user
apiRouter.delete('/users/:id_user', userController.deleteUser); // Delete user

app.use('/api', apiRouter);

module.exports = apiRouter;
