import express from "express";
import {
  getProductReviews,
  createReview,
  updateReview,
  deleteReview,
  getMyReviews,
  canReviewProduct,
  getAllReviews,
  updateReviewStatus,
  adminDeleteReview,
} from "../controllers/reviewController.js";
import { authenticate, authorize } from "../middlewares/auth.js";

const router = express.Router();

// ==================== PUBLIC ROUTES ====================

// Get all reviews for a product (public)
router.get("/products/:productId/reviews", getProductReviews);

// ==================== CUSTOMER ROUTES ====================

// Get my reviews
router.get("/my-reviews", authenticate, getMyReviews);

// Check if can review a product
router.get("/can-review/:productId", authenticate, canReviewProduct);

// Create a review (customer only)
router.post("/", authenticate, createReview);

// Update own review
router.put("/:id", authenticate, updateReview);

// Delete own review
router.delete("/:id", authenticate, deleteReview);

// ==================== ADMIN ROUTES ====================

// Get all reviews (admin)
router.get("/admin/all", authenticate, authorize("admin"), getAllReviews);

// Update review status (admin)
router.patch(
  "/admin/:id/status",
  authenticate,
  authorize("admin"),
  updateReviewStatus
);

// Delete review (admin)
router.delete(
  "/admin/:id",
  authenticate,
  authorize("admin"),
  adminDeleteReview
);

export default router;
