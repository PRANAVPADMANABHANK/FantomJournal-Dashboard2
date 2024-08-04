// routes/authRoutes.js
const express = require('express');
// const { signup } = require('../controllers/authController');
const hashPassword = require('../middleware/hashPassword');
const UserController = require('../controllers/authController');



const router = express.Router();

router.post('/signup',hashPassword, UserController.signup);
router.post('/login', UserController.login);


// Refresh token route
router.post('/refresh-token', UserController.refreshToken);


module.exports = router;
