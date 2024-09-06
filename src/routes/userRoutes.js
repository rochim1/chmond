const express = require('express');
const app = express();
const userController = require('../controllers/userController');
const diagnoseController = require('../controllers/diagnoseController');
const sideEffectController = require('../controllers/sideEffectController');
const educationController = require('../controllers/educationController');
const chemoSchController = require('../controllers/chemoSchController');
const userSideEffectController = require('../controllers/userSideEffectController');
const recomendationController = require('../controllers/recomendationController');
const monitoringLabController = require('../controllers/monitoringLabController');
const drugSchController = require('../controllers/drugSchController');

// validator
const userValidator = require('../validations/userValidator');
const loginValidator = require('../validations/loginValidator');
const diagnoseValidator = require('../validations/diagnoseValidator');
const sideEffectValidator = require('../validations/sideEfectValidator');
const {
    educationValidatorCreate,
    educationValidatorUpdate
} = require('../validations/educationValidator');
const chemoSchValidator = require('../validations/chemoSchValidator');
const userSideEffectValidator = require('../validations/userSideEffectValidator');
const monitoringLabValidator = require('../validations/monitoringLabValidator')
const drugSchValidator = require('../validations/drugValidator')

// middleware
const authMiddleware = require('../middlewares/authMiddleware')
const uploadMiddleware = require('../middlewares/uploadMiddleware');



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
apiRouter.get('/users/:id_user', authMiddleware, userController.getOneUsers); // View user
apiRouter.post('/users/create', userValidator, userController.createUser); // Create a new user
apiRouter.put('/users/update/:id_user', authMiddleware, userController.updateUser); // Update a new user
apiRouter.delete('/users/delete/:id_user', authMiddleware, userController.deleteUser); // Delete user

// Diagnose Route
apiRouter.get('/diagnose', authMiddleware, diagnoseController.getAllDiagnoses); // View all user
apiRouter.get('/diagnose/:id_diagnose', authMiddleware, diagnoseController.getOneDiagnose); // View user
apiRouter.post('/diagnose/create', authMiddleware, diagnoseValidator, diagnoseController.createDiagnose); // Create a new user
apiRouter.put('/diagnose/update/:id_diagnose', authMiddleware, diagnoseValidator, diagnoseController.updateDiagnose); // Update a new user
apiRouter.delete('/diagnose/delete/:id_diagnose', authMiddleware, diagnoseController.deleteDiagnose); // Delete user

// Side Effect Route
apiRouter.get('/side_effect', authMiddleware, sideEffectController.getAllSideEffects); // View all user
apiRouter.get('/side_effect/:id_side_effect', authMiddleware, sideEffectController.getOneSideEffect); // View user
apiRouter.post('/side_effect/create', authMiddleware, sideEffectValidator, sideEffectController.createSideEffect); // Create a new user
apiRouter.put('/side_effect/update/:id_side_effect', authMiddleware, sideEffectValidator, sideEffectController.updateSideEffect); // Update a new user
apiRouter.delete('/side_effect/delete/:id_side_effect', authMiddleware, sideEffectController.deleteSideEffect); // Delete user

// Education Route
apiRouter.get('/education', authMiddleware, educationController.getAllEducations); // View all user
apiRouter.get('/education/:id_education', authMiddleware, educationController.getOneEducation); // View user
apiRouter.post('/education/create', authMiddleware, uploadMiddleware.single('thumbnail'), educationValidatorCreate, educationController.createEducation); // Create a new user
apiRouter.put('/education/update/:id_education', authMiddleware, uploadMiddleware.single('thumbnail'), educationValidatorUpdate, educationController.updateEducation); // Update a new user
apiRouter.delete('/education/delete/:id_education', authMiddleware, educationController.deleteEducation); // Delete user

apiRouter.get('/recomendation', authMiddleware, recomendationController.getRecomendation);

// Chemo Schedule Route
apiRouter.get('/chemo', authMiddleware, chemoSchController.getAllChemoSchedules); // View all user
apiRouter.get('/chemo/:id_chemoSchedule', authMiddleware, chemoSchController.getOneChemoSchedule); // View user
apiRouter.post('/chemo/create', authMiddleware, chemoSchValidator, chemoSchController.createChemoSchedule); // Create a new user
apiRouter.put('/chemo/update/:id_chemoSchedule', authMiddleware, chemoSchValidator, chemoSchController.updateChemoSchedule); // Update a new user
apiRouter.delete('/chemo/delete/:id_chemoSchedule', authMiddleware, chemoSchController.deleteChemoSchedule); // Delete user

// user Side Effect Route
apiRouter.get('/user_side_effect', authMiddleware, userSideEffectController.getAllUserSideEffects); // View all user
apiRouter.get('/user_side_effect/:id_user_side_effect', authMiddleware, userSideEffectController.getOneUserSideEffect); // View user
apiRouter.post('/user_side_effect/create', authMiddleware, userSideEffectValidator, userSideEffectController.createUserSideEffect); // Create a new user
apiRouter.put('/user_side_effect/update/:id_user_side_effect', authMiddleware, userSideEffectValidator, userSideEffectController.updateUserSideEffect); // Update a new user
apiRouter.delete('/user_side_effect/delete/:id_user_side_effect', authMiddleware, userSideEffectController.deleteUserSideEffect); // Delete user

// monitoring laboratorium Route
apiRouter.get('/monitoring_lab', authMiddleware, monitoringLabController.getAllMonitoringLab); // View all user
apiRouter.get('/monitoring_lab/:id_monitoring_lab', authMiddleware, monitoringLabController.getOneMonitorLab); // View user
apiRouter.post('/monitoring_lab/create', authMiddleware, monitoringLabValidator, monitoringLabController.createMonitorLab); // Create a new user
apiRouter.put('/monitoring_lab/update/:id_monitoring_lab', authMiddleware, monitoringLabValidator, monitoringLabController.updateMonitorLab); // Update a new user
apiRouter.delete('/monitoring_lab/delete/:id_monitoring_lab', authMiddleware, monitoringLabController.deleteMonitorLab); // Delete user

// drug schedule Route
apiRouter.get('/drug_schedule', authMiddleware, drugSchController.getAllDrugSchedules); // View all user
apiRouter.get('/drug_schedule/:id_drug_schedule', authMiddleware, drugSchController.getOneDrugSchdules); // View user
apiRouter.post('/drug_schedule/create', authMiddleware, drugSchValidator, drugSchController.createDrugSchedule); // Create a new user
apiRouter.put('/drug_schedule/update/:id_drug_schedule', authMiddleware, drugSchValidator, drugSchController.updateDrugSchedule); // Update a new user
apiRouter.delete('/drug_schedule/delete/:id_drug_schedule', authMiddleware, drugSchController.deleteDrugSchedule); // Delete user

module.exports = {
    apiRouter,
    api
};