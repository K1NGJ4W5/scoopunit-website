const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { User } = require('../models/User');
const { Client } = require('../models/Client');
const AuthController = require('../controllers/AuthController');

// Register new client (from website estimation tool)
router.post('/register/client', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('firstName').trim().isLength({ min: 1 }),
  body('lastName').trim().isLength({ min: 1 }),
  body('phone').isMobilePhone(),
  body('address').isObject(),
  body('serviceDetails').isObject()
], AuthController.registerClient);

// Client onboarding (detailed registration)
router.post('/onboarding/client', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('firstName').trim().isLength({ min: 1 }),
  body('lastName').trim().isLength({ min: 1 }),
  body('phone').isMobilePhone(),
  body('address').isObject(),
  body('propertyDetails').isObject(),
  body('servicePreferences').isObject(),
  body('paymentMethod').isObject()
], AuthController.completeClientOnboarding);

// Login for all user types
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 1 })
], AuthController.login);

// Refresh token
router.post('/refresh-token', AuthController.refreshToken);

// Logout
router.post('/logout', AuthController.logout);

// Password reset request
router.post('/forgot-password', [
  body('email').isEmail().normalizeEmail()
], AuthController.forgotPassword);

// Password reset
router.post('/reset-password', [
  body('token').isLength({ min: 1 }),
  body('password').isLength({ min: 6 })
], AuthController.resetPassword);

// Email verification
router.get('/verify-email/:token', AuthController.verifyEmail);
router.post('/resend-verification', [
  body('email').isEmail().normalizeEmail()
], AuthController.resendVerification);

// Check email availability
router.post('/check-email', [
  body('email').isEmail().normalizeEmail()
], AuthController.checkEmailAvailability);

// Admin: Create employee accounts
router.post('/create-employee', [
  body('email').isEmail().normalizeEmail(),
  body('role').isIn(['field_tech', 'manager', 'admin']),
  body('firstName').trim().isLength({ min: 1 }),
  body('lastName').trim().isLength({ min: 1 }),
  body('employeeDetails').isObject()
], AuthController.createEmployee);

// Mobile app authentication
router.post('/mobile/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 1 }),
  body('deviceId').isLength({ min: 1 }),
  body('platform').isIn(['ios', 'android'])
], AuthController.mobileLogin);

router.post('/mobile/logout', AuthController.mobileLogout);

module.exports = router;