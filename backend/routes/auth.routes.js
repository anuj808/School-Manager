const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { body } = require('express-validator');
const authController = require('../controllers/auth.controller');
const verifyToken = require('../middleware/verifyToken');

// Auth Rate Limiter (10 req/min)
const authLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many authentication attempts, please try again later.' }
});

const loginValidation = [
  body('school_id').notEmpty().withMessage('School ID is required'),
  body('username').notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required')
];

router.post('/login', authLimiter, loginValidation, authController.login);
router.post('/refresh-token', authLimiter, authController.refreshToken);
router.post('/logout', authController.logout);

router.post('/change-password', verifyToken, [
  body('oldPassword').notEmpty().withMessage('Old password is required'),
  body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters long')
], authController.changePassword);

module.exports = router;
