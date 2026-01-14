import express from 'express';
import * as couponController from '../controllers/couponController.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = express.Router();

// Public routes
router.post('/validate', couponController.validateCoupon);

// Protected routes - require authentication
router.use(authenticate);

// Admin routes
router.get('/', authorize('admin'), couponController.getCoupons);
router.get('/stats', authorize('admin'), couponController.getCouponStats);
router.get('/:id', authorize('admin'), couponController.getCoupon);
router.post('/', authorize('admin'), couponController.createCoupon);
router.put('/:id', authorize('admin'), couponController.updateCoupon);
router.patch('/:id/status', authorize('admin'), couponController.updateCouponStatus);
router.delete('/:id', authorize('admin'), couponController.deleteCoupon);

export default router;