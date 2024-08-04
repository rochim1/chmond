const express = require('express');
const userController = require('../controllers/userController');
const router = express.Router();

router.get('/users', userController.getAllUsers);


// User Routes
router.post('/users', userController.createUser); // Create a new user
router.post('/auth/google', userController.createUserByGoogle); // Authenticate with Google
router.post('/login', userController.login); // Login user
router.put('/users/:id_user', userController.editUser); // Edit user
router.delete('/users/:id_user', userController.deleteUser); // Delete user

module.exports = router;
