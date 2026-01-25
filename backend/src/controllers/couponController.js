import { Coupon } from '../models/index.js';
import { NotFoundError, ValidationError } from '../utils/errors.js';
import { catchAsync } from '../utils/errors.js';
import { Op } from 'sequelize';
import sequelize from '../database/config.js';

/**
 * Get all coupons with filtering and pagination
 */
export const getCoupons = catchAsync(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    search,
    status,
    type,
    sortBy = 'created_at',
    sortOrder = 'desc'
  } = req.query;

  const offset = (page - 1) * limit;
  const where = {};

  // Search filter
  if (search) {
    where[Op.or] = [
      { code: { [Op.like]: `%${search}%` } },
      { name: { [Op.like]: `%${search}%` } }
    ];
  }

  // Status filter
  if (status) {
    where.status = status;
  }

  // Type filter
  if (type) {
    where.type = type;
  }

  const { count, rows: coupons } = await Coupon.findAndCountAll({
    where,
    limit: parseInt(limit),
    offset: parseInt(offset),
    order: [[sortBy, sortOrder.toUpperCase()]]
  });

  const totalPages = Math.ceil(count / limit);

  res.json({
    status: 'success',
    data: {
      coupons,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: count,
        itemsPerPage: parseInt(limit),
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    }
  });
});


export const getCoupon = catchAsync(async (req, res) => {
  const { id } = req.params;

  const coupon = await Coupon.findByPk(id);

  if (!coupon) {
    throw new NotFoundError('Coupon not found');
  }

  res.json({
    status: 'success',
    data: {
      coupon
    }
  });
});


export const createCoupon = catchAsync(async (req, res) => {
  const {
    code,
    name,
    description,
    type,
    value,
    minimumOrderAmount,
    maximumDiscountAmount,
    usageLimit,
    startDate,
    endDate,
    status = 'active'
  } = req.body;

  // Validate dates
  if (new Date(startDate) >= new Date(endDate)) {
    throw new ValidationError('Start date must be before end date');
  }

  // Check if coupon code already exists
  const existingCoupon = await Coupon.findOne({ where: { code: code.toUpperCase() } });
  if (existingCoupon) {
    throw new ValidationError('Coupon code already exists');
  }

  const coupon = await Coupon.create({
    code: code.toUpperCase(),
    name,
    description,
    type,
    value,
    minimumOrderAmount: minimumOrderAmount || null,
    maximumDiscountAmount: maximumDiscountAmount || null,
    usageLimit: usageLimit || null,
    startsAt: startDate,
    expiresAt: endDate,
    status
  });

  res.status(201).json({
    status: 'success',
    message: 'Coupon created successfully',
    data: {
      coupon
    }
  });
});


export const updateCoupon = catchAsync(async (req, res) => {
  const { id } = req.params;
  const {
    code,
    name,
    description,
    type,
    value,
    minimumOrderAmount,
    maximumDiscountAmount,
    usageLimit,
    startDate,
    endDate,
    status
  } = req.body;

  const coupon = await Coupon.findByPk(id);

  if (!coupon) {
    throw new NotFoundError('Coupon not found');
  }

  
  if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
    throw new ValidationError('Start date must be before end date');
  }

  // Check if coupon code already exists (exclude current coupon)
  if (code && code !== coupon.code) {
    const existingCoupon = await Coupon.findOne({ 
      where: { 
        code: code.toUpperCase(),
        id: { [Op.ne]: id }
      } 
    });
    if (existingCoupon) {
      throw new ValidationError('Coupon code already exists');
    }
  }

  await coupon.update({
    code: code ? code.toUpperCase() : coupon.code,
    name: name || coupon.name,
    description: description !== undefined ? description : coupon.description,
    type: type || coupon.type,
    value: value !== undefined ? value : coupon.value,
    minimumOrderAmount: minimumOrderAmount !== undefined ? minimumOrderAmount : coupon.minimumOrderAmount,
    maximumDiscountAmount: maximumDiscountAmount !== undefined ? maximumDiscountAmount : coupon.maximumDiscountAmount,
    usageLimit: usageLimit !== undefined ? usageLimit : coupon.usageLimit,
    startsAt: startDate || coupon.startsAt,
    expiresAt: endDate || coupon.expiresAt,
    status: status || coupon.status
  });

  res.json({
    status: 'success',
    message: 'Coupon updated successfully',
    data: {
      coupon
    }
  });
});


export const deleteCoupon = catchAsync(async (req, res) => {
  const { id } = req.params;

  const coupon = await Coupon.findByPk(id);

  if (!coupon) {
    throw new NotFoundError('Coupon not found');
  }

  await coupon.destroy();

  res.status(204).json({
    status: 'success',
    data: null
  });
});

/**
 * Validate coupon code
 */
export const validateCoupon = catchAsync(async (req, res) => {
  const { code } = req.body;

  if (!code) {
    throw new ValidationError('Coupon code is required');
  }

  const result = await Coupon.findValidCoupon(code);

  if (!result.coupon) {
    return res.status(400).json({
      status: 'error',
      message: result.error
    });
  }

  res.json({
    status: 'success',
    data: {
      coupon: result.coupon,
      valid: true
    }
  });
});

/**
 * Update coupon status
 */
export const updateCouponStatus = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['active', 'inactive'].includes(status)) {
    throw new ValidationError('Invalid status. Must be active or inactive');
  }

  const coupon = await Coupon.findByPk(id);

  if (!coupon) {
    throw new NotFoundError('Coupon not found');
  }

  await coupon.update({ status });

  res.json({
    status: 'success',
    message: 'Coupon status updated successfully',
    data: {
      coupon
    }
  });
});

/**
 * Get coupon statistics
 */
export const getCouponStats = catchAsync(async (req, res) => {
  const totalCoupons = await Coupon.count();
  const activeCoupons = await Coupon.count({ where: { status: 'active' } });
  const expiredCoupons = await Coupon.count({
    where: {
      expiresAt: { [Op.lt]: new Date() }
    }
  });
  const usedUpCoupons = await Coupon.count({
    where: {
      usageLimit: { [Op.not]: null },
      usedCount: { [Op.gte]: sequelize.col('usage_limit') }
    }
  });

  res.json({
    status: 'success',
    data: {
      stats: {
        total: totalCoupons,
        active: activeCoupons,
        expired: expiredCoupons,
        usedUp: usedUpCoupons
      }
    }
  });
});