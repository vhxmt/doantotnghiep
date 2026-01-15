import {
  Review,
  Product,
  User,
  Order,
  OrderItem,
  ProductImage,
} from "../models/index.js";
import { catchAsync } from "../utils/errors.js";
import { Op } from "sequelize";

/**
 * Get all reviews for a product
 */
export const getProductReviews = catchAsync(async (req, res) => {
  const { productId } = req.params;
  const {
    page = 1,
    limit = 10,
    rating,
    sort = "created_at",
    order = "desc",
  } = req.query;

  const offset = (page - 1) * limit;
  const where = {
    productId,
    status: "approved", // Only show approved reviews to customers
  };

  // Filter by rating
  if (rating) {
    where.rating = rating;
  }

  const { count, rows: reviews } = await Review.findAndCountAll({
    where,
    limit: parseInt(limit),
    offset,
    order: [[sort, order.toUpperCase()]],
    include: [
      {
        model: User,
        as: "user",
        attributes: ["id", "firstName", "lastName", "email", "avatar"],
      },
    ],
  });

  // Get rating statistics
  const stats = await Review.getAverageRating(productId);
  const distribution = await Review.getRatingDistribution(productId);

  res.json({
    status: "success",
    data: {
      reviews,
      statistics: {
        ...stats,
        distribution,
      },
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit),
      },
    },
  });
});

/**
 * Create a review (Customer only, must have purchased)
 */
export const createReview = catchAsync(async (req, res) => {
  const { productId, orderId, rating, title, comment } = req.body;
  const userId = req.user.id;

  // Check if product exists
  const product = await Product.findByPk(productId);
  if (!product) {
    return res.status(404).json({
      status: "error",
      message: "Product not found",
    });
  }

  // Check if order exists and belongs to user
  const order = await Order.findOne({
    where: {
      id: orderId,
      userId,
      status: "delivered", // Only can review delivered orders
    },
    include: [
      {
        model: OrderItem,
        as: "items",
        where: { productId },
      },
    ],
  });

  if (!order) {
    return res.status(403).json({
      status: "error",
      message: "You can only review products from your delivered orders",
    });
  }

  // Check if already reviewed
  const existingReview = await Review.findOne({
    where: {
      userId,
      productId,
      orderId,
    },
  });

  if (existingReview) {
    return res.status(400).json({
      status: "error",
      message: "You have already reviewed this product",
    });
  }

  // Create review
  const review = await Review.create({
    productId,
    userId,
    orderId,
    rating,
    title,
    comment,
    status: "approved", // Auto-approve for now, can change to 'pending'
  });

  // Fetch review with user info
  const reviewWithUser = await Review.findByPk(review.id, {
    include: [
      {
        model: User,
        as: "user",
        attributes: ["id", "firstName", "lastName", "email", "avatar"],
      },
    ],
  });

  res.status(201).json({
    status: "success",
    message: "Review created successfully",
    data: { review: reviewWithUser },
  });
});

/**
 * Update own review
 */
export const updateReview = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { rating, title, comment } = req.body;
  const userId = req.user.id;

  const review = await Review.findOne({
    where: { id, userId },
  });

  if (!review) {
    return res.status(404).json({
      status: "error",
      message: "Review not found or you do not have permission to edit it",
    });
  }

  // Update fields
  if (rating !== undefined) review.rating = rating;
  if (title !== undefined) review.title = title;
  if (comment !== undefined) review.comment = comment;

  await review.save();

  const updatedReview = await Review.findByPk(review.id, {
    include: [
      {
        model: User,
        as: "user",
        attributes: ["id", "firstName", "lastName", "email", "avatar"],
      },
    ],
  });

  res.json({
    status: "success",
    message: "Review updated successfully",
    data: { review: updatedReview },
  });
});

/**
 * Delete own review
 */
export const deleteReview = catchAsync(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const review = await Review.findOne({
    where: { id, userId },
  });

  if (!review) {
    return res.status(404).json({
      status: "error",
      message: "Review not found or you do not have permission to delete it",
    });
  }

  await review.destroy();

  res.json({
    status: "success",
    message: "Review deleted successfully",
  });
});

/**
 * Get user's own reviews
 */
export const getMyReviews = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const { page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  const { count, rows: reviews } = await Review.findAndCountAll({
    where: { userId },
    limit: parseInt(limit),
    offset,
    order: [["created_at", "DESC"]],
    include: [
      {
        model: Product,
        as: "product",
        attributes: ["id", "name", "slug"],
        include: [
          {
            model: ProductImage,
            as: "images",
            where: { isPrimary: true },
            required: false,
            limit: 1,
          },
        ],
      },
    ],
  });

  res.json({
    status: "success",
    data: {
      reviews,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit),
      },
    },
  });
});

/**
 * Check if user can review a product
 */
export const canReviewProduct = catchAsync(async (req, res) => {
  const { productId } = req.params;
  const userId = req.user.id;

  // Check if user has delivered order with this product
  const order = await Order.findOne({
    where: {
      userId,
      status: "delivered",
    },
    include: [
      {
        model: OrderItem,
        as: "items",
        where: { productId },
      },
    ],
  });

  if (!order) {
    return res.json({
      status: "success",
      data: {
        canReview: false,
        reason:
          "You need to purchase and receive this product before reviewing",
      },
    });
  }

  // Check if already reviewed
  const existingReview = await Review.findOne({
    where: {
      userId,
      productId,
      orderId: order.id,
    },
  });

  if (existingReview) {
    return res.json({
      status: "success",
      data: {
        canReview: false,
        reason: "You have already reviewed this product",
        review: existingReview,
      },
    });
  }

  res.json({
    status: "success",
    data: {
      canReview: true,
      orderId: order.id,
    },
  });
});

// ==================== ADMIN ENDPOINTS ====================

/**
 * Get all reviews (Admin)
 */
export const getAllReviews = catchAsync(async (req, res) => {
  const { page = 1, limit = 20, status, rating, productId } = req.query;

  const offset = (page - 1) * limit;
  const where = {};

  if (status) where.status = status;
  if (rating) where.rating = rating;
  if (productId) where.productId = productId;

  const { count, rows: reviews } = await Review.findAndCountAll({
    where,
    limit: parseInt(limit),
    offset,
    order: [["created_at", "DESC"]],
    include: [
      {
        model: User,
        as: "user",
        attributes: ["id", "firstName", "lastName", "email", "avatar"],
      },
      {
        model: Product,
        as: "product",
        attributes: ["id", "name", "slug"],
      },
    ],
  });

  res.json({
    status: "success",
    data: {
      reviews,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit),
      },
    },
  });
});

/**
 * Update review status (Admin)
 */
export const updateReviewStatus = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // Validate status
  if (!['pending', 'approved', 'rejected'].includes(status)) {
    return res.status(400).json({
      status: "error",
      message: "Invalid status. Must be one of: pending, approved, rejected",
    });
  }

  const review = await Review.findByPk(id);
  if (!review) {
    return res.status(404).json({
      status: "error",
      message: "Review not found",
    });
  }

  review.status = status;
  await review.save();

  const updatedReview = await Review.findByPk(id, {
    include: [
      {
        model: User,
        as: "user",
        attributes: ["id", "firstName", "lastName", "email", "avatar"],
      },
      {
        model: Product,
        as: "product",
        attributes: ["id", "name", "slug"],
      },
    ],
  });

  res.json({
    status: "success",
    message: `Review ${status} successfully`,
    data: { review: updatedReview },
  });
});

/**
 * Delete review (Admin)
 */
export const adminDeleteReview = catchAsync(async (req, res) => {
  const { id } = req.params;

  const review = await Review.findByPk(id);
  if (!review) {
    return res.status(404).json({
      status: "error",
      message: "Review not found",
    });
  }

  await review.destroy();

  res.json({
    status: "success",
    message: "Review deleted successfully",
  });
});
