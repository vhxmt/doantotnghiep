import express from 'express';
import * as zalopayController from '../controllers/zalopayController.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

// Create ZaloPay payment order (requires authentication)
router.post('/create-order', authenticate, zalopayController.createZaloPayOrder);

// ZaloPay callback (public - called by ZaloPay server)
router.post('/callback', zalopayController.zalopayCallback);

// Query order status
router.get('/query/:appTransId', zalopayController.queryZaloPayOrder);

export default router;
