import express from 'express';
import { body } from 'express-validator';
import { register, verifyOTP, login, refreshToken, logout, protectedRoute, forgotPassword, resetPassword } from '../controllers/authController';
import { authenticateToken } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validationMiddleware';

const router = express.Router();

// Registration with basic input validation.
router.post(
  '/register',
  [
    body('name').notEmpty().withMessage('Name is required.'),
    body('email').isEmail().withMessage('Valid email is required.'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters.')
  ],
  validateRequest,
  register
);

// OTP verification.
router.post(
  '/verify-otp',
  [
    body('email').isEmail().withMessage('Valid email is required.'),
    body('otp').notEmpty().withMessage('OTP is required.')
  ],
  validateRequest,
  verifyOTP
);

// Login.
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required.'),
    body('password').notEmpty().withMessage('Password is required.')
  ],
  validateRequest,
  login
);

// Refresh token.
router.post(
  '/refresh-token',
  [body('refreshToken').notEmpty().withMessage('Refresh token is required.')],
  validateRequest,
  refreshToken
);

// Logout.
router.post(
  '/logout',
  [body('refreshToken').notEmpty().withMessage('Refresh token is required.')],
  validateRequest,
  logout
);

// Forgot password route.
router.post(
  '/forgot-password',
  [body('email').isEmail().withMessage('Valid email is required.')],
  validateRequest,
  forgotPassword
);

// Reset password route.
router.post(
  '/reset-password',
  [
    body('email').isEmail().withMessage('Valid email is required.'),
    body('otp').notEmpty().withMessage('OTP is required.'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters.')
  ],
  validateRequest,
  resetPassword
);

// Protected route.
router.get('/protected', authenticateToken, protectedRoute);

export default router;
