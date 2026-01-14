import express from 'express';
import { 
  getDashboardStats, 
  getSalesStats, 
  getTopProducts 
} from '../controllers/statsController.js';
import { authenticate } from '../middlewares/auth.js';
import { authorize } from '../middlewares/auth.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

// Dashboard stats - Admin only
router.get('/dashboard', authorize('admin'), getDashboardStats);

// Sales stats - Admin only
router.get('/sales', authorize('admin'), getSalesStats);

// Top products - Admin only
router.get('/top-products', authorize('admin'), getTopProducts);

export default router;
