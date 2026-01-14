import express from 'express';
import * as productController from '../controllers/productController.js';
import { authenticate, authorize, requirePermission } from '../middlewares/auth.js';
// import { productValidation, queryValidation } from '../middlewares/validation.js';

const router = express.Router();

// Public routes
router.get('/', productController.getProducts);
router.get('/featured', productController.getFeaturedProducts);
router.get('/category/:categoryId', productController.getProductsByCategory);
router.get('/:id', productController.getProduct);

// Protected routes - require authentication
router.use(authenticate);

// Staff/Admin routes
router.patch('/:id/status',
  authorize('staff', 'admin'),
  productController.updateProductStatus
);

// Admin only routes
router.post('/',
  authorize('admin'),
  productController.createProduct
);

router.put('/:id',
  authorize('admin'),
  productController.updateProduct
);

router.delete('/:id',
  authorize('admin'),
  productController.deleteProduct
);

export default router;
