import express from 'express';
import * as authController from '../controllers/authController.js';
import { authenticate } from '../middlewares/auth.js';
import { userValidation } from '../middlewares/validation.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 5 : 50, // 5 in production, 50 in dev
  message: {
    status: 'error',
    message: 'Too many authentication attempts, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false
});

// Public routes
router.post('/register', authLimiter, userValidation.register, authController.register);
router.post('/login', authLimiter, userValidation.login, authController.login);
router.post('/refresh-token', generalLimiter, authController.refreshToken);
router.post('/forgot-password', authLimiter, userValidation.forgotPassword, authController.forgotPassword);
router.get('/verify-reset-token', authController.verifyResetToken);
router.post('/reset-password', authLimiter, userValidation.resetPassword, authController.resetPassword);
router.post('/verify-email', generalLimiter, authController.verifyEmail);
router.post('/resend-verification', authLimiter, authController.resendVerification);

// Protected routes
router.use(authenticate); // All routes below require authentication

router.post('/logout', authController.logout);
router.get('/profile', authController.getProfile);
router.put('/profile', userValidation.updateProfile, authController.updateProfile);
router.put('/change-password', userValidation.changePassword, authController.changePassword);

export default router;
