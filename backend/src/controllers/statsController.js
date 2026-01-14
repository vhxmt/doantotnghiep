import { catchAsync } from "../utils/errors.js";
import {
  User,
  Product,
  Order,
  OrderItem,
  Inventory,
  ProductImage,
} from "../models/index.js";
import { Op } from "sequelize";
import sequelize from "../database/config.js";

/**
 * @desc    Get dashboard statistics
 * @route   GET /api/v1/stats/dashboard
 * @access  Private/Admin
 */
export const getDashboardStats = catchAsync(async (req, res) => {
  console.log("📊 Fetching dashboard statistics...");

  // 1. Total Users (all users in the system)
  const totalUsers = await User.count({
    where: {
      status: "active",
    },
  });

  // 2. Total Products
  const totalProducts = await Product.count({
    where: { status: "active" },
  });

  // 3. Total Orders
  const totalOrders = await Order.count();

  // 4. Total Revenue (from delivered orders)
  const revenueResult = await Order.findOne({
    attributes: [
      [sequelize.fn("SUM", sequelize.col("total_amount")), "totalRevenue"],
    ],
    where: {
      status: "delivered",
    },
    raw: true,
  });
  const totalRevenue = parseFloat(revenueResult?.totalRevenue || 0);

  // 5. Pending Orders
  const pendingOrders = await Order.count({
    where: {
      status: {
        [Op.in]: ["pending", "confirmed", "packing"],
      },
    },
  });

  // 6. Low Stock Products (quantity <= 10)
  // Check if Inventory table exists
  let lowStockProducts = 0;
  try {
    lowStockProducts = await Inventory.count({
      where: {
        quantity: {
          [Op.lte]: 10,
        },
      },
    });
  } catch (error) {
    console.warn("⚠️  Inventory table not found, skipping low stock check");
    lowStockProducts = 0;
  }

  // 7. Recent stats for trends (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentOrders = await Order.count({
    where: {
      created_at: {
        [Op.gte]: thirtyDaysAgo,
      },
    },
  });

  const recentRevenue = await Order.findOne({
    attributes: [
      [sequelize.fn("SUM", sequelize.col("total_amount")), "revenue"],
    ],
    where: {
      status: "delivered",
      created_at: {
        [Op.gte]: thirtyDaysAgo,
      },
    },
    raw: true,
  });

  // 8. Previous month stats for comparison
  const sixtyDaysAgo = new Date();
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

  const previousMonthRevenue = await Order.findOne({
    attributes: [
      [sequelize.fn("SUM", sequelize.col("total_amount")), "revenue"],
    ],
    where: {
      status: "delivered",
      created_at: {
        [Op.between]: [sixtyDaysAgo, thirtyDaysAgo],
      },
    },
    raw: true,
  });

  // Calculate trends
  const currentMonthRevenue = parseFloat(recentRevenue?.revenue || 0);
  const prevMonthRevenue = parseFloat(previousMonthRevenue?.revenue || 0);

  const revenueTrend =
    prevMonthRevenue > 0
      ? (
          ((currentMonthRevenue - prevMonthRevenue) / prevMonthRevenue) *
          100
        ).toFixed(1)
      : 0;

  console.log("✅ Dashboard stats calculated:", {
    totalUsers,
    totalProducts,
    totalOrders,
    totalRevenue,
    pendingOrders,
    lowStockProducts,
    revenueTrend,
  });

  res.json({
    status: "success",
    data: {
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue,
      pendingOrders,
      lowStockProducts,
      trends: {
        revenue: {
          current: currentMonthRevenue,
          previous: prevMonthRevenue,
          percentage: parseFloat(revenueTrend),
        },
        orders: {
          recent: recentOrders,
        },
      },
    },
  });
});

/**
 * @desc    Get sales report by date range
 * @route   GET /api/v1/stats/sales
 * @access  Private/Admin
 */
export const getSalesStats = catchAsync(async (req, res) => {
  const { startDate, endDate, groupBy = "day" } = req.query;

  const whereClause = {
    status: "delivered",
  };

  if (startDate && endDate) {
    whereClause.created_at = {
      [Op.between]: [new Date(startDate), new Date(endDate)],
    };
  }

  const orders = await Order.findAll({
    where: whereClause,
    attributes: [
      [sequelize.fn("DATE", sequelize.col("created_at")), "date"],
      [sequelize.fn("COUNT", sequelize.col("id")), "orderCount"],
      [sequelize.fn("SUM", sequelize.col("total_amount")), "revenue"],
    ],
    group: [sequelize.fn("DATE", sequelize.col("created_at"))],
    order: [[sequelize.fn("DATE", sequelize.col("created_at")), "DESC"]],
    raw: true,
  });

  res.json({
    status: "success",
    data: {
      sales: orders,
    },
  });
});

/**
 * @desc    Get top selling products
 * @route   GET /api/v1/stats/top-products
 * @access  Private/Admin
 */
export const getTopProducts = catchAsync(async (req, res) => {
  const { limit = 10 } = req.query;

  console.log("📊 Fetching top products (delivered orders only)...");

  // Dùng raw query để tránh lỗi ONLY_FULL_GROUP_BY
  // CHỈ TÍNH TỪ ĐƠN HÀNG ĐÃ GIAO (delivered)
  const results = await sequelize.query(
    `
    SELECT 
      oi.product_id as productId,
      p.id,
      p.name,
      p.price,
      SUM(oi.quantity) as totalSold,
      SUM(oi.total_price) as totalRevenue,
      (SELECT pi.image_url 
       FROM product_images pi 
       WHERE pi.product_id = p.id 
       LIMIT 1) as imageUrl
    FROM order_items oi
    INNER JOIN orders o ON oi.order_id = o.id
    INNER JOIN products p ON oi.product_id = p.id
    WHERE o.status = 'delivered'
    GROUP BY oi.product_id, p.id, p.name, p.price
    ORDER BY totalSold DESC
    LIMIT :limit
  `,
    {
      replacements: { limit: parseInt(limit) },
      type: sequelize.QueryTypes.SELECT,
    }
  );

  console.log(`✅ Found ${results.length} top products`);
  if (results.length > 0) {
    console.log("Top 3:", results.slice(0, 3).map(p => ({ 
      name: p.name, 
      sold: p.totalSold, 
      revenue: p.totalRevenue 
    })));
  }

  // Format lại data để giống cấu trúc cũ
  const topProducts = results.map((item) => ({
    productId: item.productId,
    totalSold: parseInt(item.totalSold),
    totalRevenue: parseFloat(item.totalRevenue),
    product: {
      id: item.id,
      name: item.name,
      price: parseFloat(item.price),
      images: item.imageUrl ? [{ imageUrl: item.imageUrl }] : [],
    },
  }));

  res.json({
    status: "success",
    data: {
      topProducts,
    },
  });
});
