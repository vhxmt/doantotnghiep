import express from "express";
import authRoutes from "./auth.js";
import productRoutes from "./products.js";
import categoryRoutes from "./categoryRoutes.js";
import orderRoutes from "./orders.js";
import userRoutes from "./users.js";
import uploadRoutes from "./uploads.js";
import couponRoutes from "./coupons.js";
import statsRoutes from "./stats.js";
import reviewRoutes from "./reviews.js";
import vnpayRoutes from "./vnpay.js";
import zalopayRoutes from "./zalopay.js";

const router = express.Router();

// API version prefix
const API_VERSION = "/api/v1";

// Health check endpoint
router.get("/health", (req, res) => {
  res.json({
    status: "success",
    message: "Memory Lane API is running",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

// Mount routes
router.use(`${API_VERSION}/auth`, authRoutes);
router.use(`${API_VERSION}/products`, productRoutes);
router.use(`${API_VERSION}/categories`, categoryRoutes);
router.use(`${API_VERSION}/orders`, orderRoutes);
router.use(`${API_VERSION}/users`, userRoutes);
router.use(`${API_VERSION}/uploads`, uploadRoutes);
router.use(`${API_VERSION}/coupons`, couponRoutes);
router.use(`${API_VERSION}/stats`, statsRoutes);
router.use(`${API_VERSION}/reviews`, reviewRoutes);
router.use(`${API_VERSION}/vnpay`, vnpayRoutes);
router.use(`${API_VERSION}/zalopay`, zalopayRoutes);

// 404 handler for API routes
router.use(`${API_VERSION}/*`, (req, res) => {
  res.status(404).json({
    status: "error",
    message: "API endpoint not found",
    path: req.originalUrl,
  });
});

export default router;
