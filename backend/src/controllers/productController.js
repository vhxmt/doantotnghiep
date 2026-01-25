import {
  Product,
  Category,
  ProductImage,
  Inventory,
  ProductCategory,
  Review,
  OrderItem,
} from "../models/index.js";
import { NotFoundError, ValidationError } from "../utils/errors.js";
import { catchAsync } from "../utils/errors.js";
import { Op } from "sequelize";
import sequelize from "../database/config.js";

/**
 * Get all products with filtering, sorting, and pagination
 */
export const getProducts = catchAsync(async (req, res) => {
  const {
    page = 1,
    limit = 12,
    q,
    search,
    category,
    minPrice,
    maxPrice,
    status,
    featured,
    sort = "created_at",
    order = "desc",
  } = req.query;

  const offset = (page - 1) * limit;
  const where = {};
  const include = [
    {
      model: ProductImage,
      as: "images",
      required: false,
      separate: true, // Important: This allows ORDER BY in associations
      order: [
        ["isPrimary", "DESC"],
        ["sortOrder", "ASC"],
      ],
    },
    {
      model: Category,
      as: "categories",
      through: { attributes: [] },
    },
    {
      model: Inventory,
      as: "inventory",
    },
  ];

  // Build where conditions
  // Filter by status:
  // - If status is explicitly '' (empty string) -> không filter (cho admin/staff)
  // - If status is provided with value -> filter theo value đó
  // - If status is undefined -> default 'active' (cho customer/public)
  if (status === undefined) {
    where.status = "active"; // Default for public/customer
  } else if (status !== "") {
    where.status = status; // Filter by specific status
  }
  // else: status === '' -> không filter (show all cho admin/staff)

  if (featured !== undefined) {
    where.featured = featured === "true";
  }

  // Handle search query (support both 'q' and 'search' parameters for backward compatibility)
  const searchQuery = search || q;
  if (searchQuery) {
    where[Op.or] = [
      { name: { [Op.like]: `%${searchQuery}%` } },
      { description: { [Op.like]: `%${searchQuery}%` } },
      { sku: { [Op.like]: `%${searchQuery}%` } },
    ];
  }

  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) where.price[Op.gte] = minPrice;
    if (maxPrice) where.price[Op.lte] = maxPrice;
  }

  // Filter by category
  if (category) {
    include.push({
      model: Category,
      as: "categories",
      where: { id: category },
      through: { attributes: [] },
      required: true,
    });
  }

  // Build order clause
  const orderClause = [];
  if (sort === "price") {
    orderClause.push(["price", order.toUpperCase()]);
  } else if (sort === "name") {
    orderClause.push(["name", order.toUpperCase()]);
  } else {
    orderClause.push(["created_at", order.toUpperCase()]);
  }

  const { count, rows: products } = await Product.findAndCountAll({
    where,
    include,
    limit: parseInt(limit),
    offset: parseInt(offset),
    order: orderClause,
    distinct: true,
    attributes: {
      include: [
        [
          sequelize.literal(`(
            SELECT COALESCE(AVG(rating), 0)
            FROM reviews
            WHERE reviews.product_id = Product.id
            )`),
          "averageRating",
        ],
        [
          sequelize.literal(`(
            SELECT COUNT(*)
            FROM reviews
            WHERE reviews.product_id = Product.id
            )`),
          "reviewCount",
        ],
      ],
    },
  });

  console.log(`📦 Found ${products.length} products`);
  if (products.length > 0) {
    console.log(
      `🖼️  First product images count: ${products[0].images?.length || 0}`
    );
  }

  const totalPages = Math.ceil(count / limit);

  res.json({
    status: "success",
    data: {
      products,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: count,
        itemsPerPage: parseInt(limit),
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    },
  });
});

/**
 * Get featured products
 */
export const getFeaturedProducts = catchAsync(async (req, res) => {
  const { limit = 8 } = req.query;

  const products = await Product.findAll({
    where: {
      status: "active",
    },
    include: [
      {
        model: ProductImage,
        as: "images",
        where: { isPrimary: true },
        required: false,
        limit: 1,
      },
      {
        model: Category,
        as: "categories",
        through: { attributes: [] },
      },
      {
        model: Inventory,
        as: "inventory",
      },
    ],
    limit: parseInt(limit),
    order: [["created_at", "DESC"]],
    attributes: {
      include: [
        [
          sequelize.literal(`(
            SELECT COALESCE(AVG(rating), 0)
            FROM reviews
            WHERE reviews.product_id = Product.id
            )`),
          "averageRating",
        ],
        [
          sequelize.literal(`(
            SELECT COUNT(*)
            FROM reviews
            WHERE reviews.product_id = Product.id
            )`),
          "reviewCount",
        ],
      ],
    },
  });

  res.json({
    status: "success",
    data: {
      products,
    },
  });
});

/**
 * Get product by ID or slug
 */
export const getProduct = catchAsync(async (req, res) => {
  const { id } = req.params;
  const isNumeric = /^\d+$/.test(id);

  const where = isNumeric ? { id } : { slug: id };

  const product = await Product.findOne({
    where,
    include: [
      {
        model: ProductImage,
        as: "images",
        separate: true,
        order: [
          ["isPrimary", "DESC"],
          ["sortOrder", "ASC"],
        ],
      },
      {
        model: Category,
        as: "categories",
        through: { attributes: [] },
      },
      {
        model: Inventory,
        as: "inventory",
      },
    ],
    attributes: {
      include: [
        [
          sequelize.literal(`(
            SELECT COALESCE(AVG(rating), 0)
            FROM reviews
            WHERE reviews.product_id = Product.id
            )`),
          "averageRating",
        ],
        [
          sequelize.literal(`(
            SELECT COUNT(*)
            FROM reviews
            WHERE reviews.product_id = Product.id
            )`),
          "reviewCount",
        ],
      ],
    },
  });

  if (!product) {
    throw new NotFoundError("Product not found");
  }

  res.json({
    status: "success",
    data: {
      product,
    },
  });
});

/**
 * Create new product (Admin only)
 */
export const createProduct = catchAsync(async (req, res) => {
  const {
    name,
    description,
    shortDescription,
    sku,
    price,
    comparePrice,
    costPrice,
    weight,
    dimensions,
    status,
    featured,
    metaTitle,
    metaDescription,
    categoryIds,
    inventory,
    imageIds,
  } = req.body;

  // Check if SKU already exists
  const existingProduct = await Product.findBySku(sku);
  if (existingProduct) {
    throw new ValidationError("SKU already exists");
  }

  // Create product
  const product = await Product.create({
    name,
    description,
    shortDescription,
    sku,
    price,
    comparePrice,
    costPrice,
    weight,
    dimensions,
    status,
    featured,
    metaTitle,
    metaDescription,
  });

  // Add categories
  if (categoryIds && categoryIds.length > 0) {
    const categories = await Category.findAll({
      where: { id: categoryIds },
    });
    await product.setCategories(categories);
  }

  // Link images to product
  if (imageIds && imageIds.length > 0) {
    console.log("🖼️  Linking images to product:", {
      productId: product.id,
      imageIds,
    });

    // Update all images: set product_id and reset isPrimary
    await ProductImage.update(
      { productId: product.id, isPrimary: false },
      { where: { id: imageIds } }
    );

    console.log("✅ Images linked, setting first as primary:", imageIds[0]);

    // Set first image as primary
    await ProductImage.update(
      { isPrimary: true },
      { where: { id: imageIds[0], productId: product.id } }
    );

    console.log("✅ Primary image set");
  }

  // Create inventory record
  if (inventory) {
    await Inventory.create({
      productId: product.id,
      quantity: inventory.quantity || 0,
      lowStockThreshold: inventory.lowStockThreshold || 10,
      trackQuantity: inventory.trackQuantity !== false,
    });
  }

  // Load product with associations
  await product.reload({
    include: [
      {
        model: ProductImage,
        as: "images",
        separate: true,
        order: [
          ["isPrimary", "DESC"],
          ["sortOrder", "ASC"],
        ],
      },
      {
        model: Category,
        as: "categories",
        through: { attributes: [] },
      },
      {
        model: Inventory,
        as: "inventory",
      },
    ],
  });

  res.status(201).json({
    status: "success",
    message: "Product created successfully",
    data: {
      product,
    },
  });
});

/**
 * Update product (Admin only)
 */
export const updateProduct = catchAsync(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  const product = await Product.findByPk(id);
  if (!product) {
    throw new NotFoundError("Product not found");
  }

  // Check SKU uniqueness if being updated
  if (updateData.sku && updateData.sku !== product.sku) {
    const existingProduct = await Product.findBySku(updateData.sku);
    if (existingProduct) {
      throw new ValidationError("SKU already exists");
    }
  }

  // Update product
  await product.update(updateData);

  // Update categories if provided
  if (updateData.categoryIds) {
    const categories = await Category.findAll({
      where: { id: updateData.categoryIds },
    });
    await product.setCategories(categories);
  }

  // Update images if provided
  if (updateData.imageIds) {
    console.log("🖼️  Updating product images:", {
      productId: product.id,
      imageIds: updateData.imageIds,
    });

    // Clear existing product images association (unlink old images)
    await ProductImage.update(
      { productId: null, isPrimary: false },
      { where: { productId: product.id } }
    );

    console.log("✅ Old images unlinked");

    // Link new images to product
    if (updateData.imageIds.length > 0) {
      await ProductImage.update(
        { productId: product.id, isPrimary: false },
        { where: { id: updateData.imageIds } }
      );

      console.log(
        "✅ New images linked, setting first as primary:",
        updateData.imageIds[0]
      );

      // Set first image as primary
      await ProductImage.update(
        { isPrimary: true },
        { where: { id: updateData.imageIds[0], productId: product.id } }
      );

      console.log("✅ Primary image set");
    }
  }

  // Update inventory if provided
  if (updateData.inventory) {
    const inventory = await Inventory.findOne({
      where: { productId: product.id },
    });

    if (inventory) {
      await inventory.update(updateData.inventory);
    } else {
      await Inventory.create({
        productId: product.id,
        ...updateData.inventory,
      });
    }
  }

  // Load updated product with associations
  await product.reload({
    include: [
      {
        model: ProductImage,
        as: "images",
        separate: true,
        order: [
          ["isPrimary", "DESC"],
          ["sortOrder", "ASC"],
        ],
      },
      {
        model: Category,
        as: "categories",
        through: { attributes: [] },
      },
      {
        model: Inventory,
        as: "inventory",
      },
    ],
  });

  res.json({
    status: "success",
    message: "Product updated successfully",
    data: {
      product,
    },
  });
});

/**
 * Delete product (Admin only)
 */
export const deleteProduct = catchAsync(async (req, res) => {
  const { id } = req.params;

  console.log(" Starting product deletion for ID:", id);

  const product = await Product.findByPk(id);

  if (!product) {
    throw new NotFoundError("Product not found");
  }

  console.log(" Product found, starting deletion of related records...");

  // Delete all related data manually to avoid foreign key constraints
  // 1. Delete product images
  try {
    const deletedImages = await ProductImage.destroy({
      where: { productId: id },
    });
    console.log(`✅ Deleted ${deletedImages} product images`);
  } catch (error) {
    console.error("❌ Error deleting product images:", error.message);
    throw error;
  }

  // 2. Delete reviews
  try {
    const deletedReviews = await Review.destroy({
      where: { productId: id },
    });
    console.log(`✅ Deleted ${deletedReviews} reviews`);
  } catch (error) {
    console.error("❌ Error deleting reviews:", error.message);
    throw error;
  }

  // 3. Delete from carts (cart_items) - only if table exists
  try {
    await sequelize.query(
      "DELETE FROM cart_items WHERE product_id = :productId",
      {
        replacements: { productId: id },
        type: sequelize.QueryTypes.DELETE,
      }
    );
    console.log("✅ Deleted cart items");
  } catch (error) {
    // Ignore if table doesn't exist (cart might be client-side only)
    if (!error.message.includes("doesn't exist")) {
      console.error("❌ Error deleting cart items:", error.message);
      throw error;
    }
    console.log("⚠️ Skipped cart_items (table does not exist)");
  }

  // 4. Delete inventory
  try {
    const deletedInventory = await Inventory.destroy({
      where: { productId: id },
    });
    console.log(` Deleted ${deletedInventory} inventory records`);
  } catch (error) {
    console.error(" Error deleting inventory:", error.message);
    throw error;
  }

  // 5. Delete order items (productId cannot be null, so we must delete)
  try {
    const deletedOrderItems = await OrderItem.destroy({
      where: { productId: id },
    });
    console.log(`✅ Deleted ${deletedOrderItems} order items`);
  } catch (error) {
    console.error("❌ Error deleting order items:", error.message);
    throw error;
  }

  // 6. Finally delete the product
  try {
    await product.destroy();
    console.log("✅ Product deleted successfully");
  } catch (error) {
    console.error("❌ Error deleting product:", error.message, error.name);
    throw error;
  }

  res.json({
    status: "success",
    message: "Product deleted successfully",
  });
});

/**
 * Update product status (Staff/Admin)
 */
export const updateProductStatus = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const product = await Product.findByPk(id, {
    include: [
      {
        model: ProductImage,
        as: "images",
        separate: true,
        order: [
          ["isPrimary", "DESC"],
          ["sortOrder", "ASC"],
        ],
      },
      {
        model: Category,
        as: "categories",
        through: { attributes: [] },
      },
      {
        model: Inventory,
        as: "inventory",
      },
    ],
  });

  if (!product) {
    throw new NotFoundError("Product not found");
  }

  await product.update({ status });

  res.json({
    status: "success",
    message: "Product status updated successfully",
    data: {
      product,
    },
  });
});

/**
 * Get products by category
 */
export const getProductsByCategory = catchAsync(async (req, res) => {
  const { categoryId } = req.params;
  const {
    page = 1,
    limit = 12,
    sort = "created_at",
    order = "desc",
  } = req.query;

  const offset = (page - 1) * limit;

  const category = await Category.findByPk(categoryId);
  if (!category) {
    throw new NotFoundError("Category not found");
  }

  const { count, rows: products } = await Product.findAndCountAll({
    include: [
      {
        model: Category,
        as: "categories",
        where: { id: categoryId },
        through: { attributes: [] },
        required: true,
      },
      {
        model: ProductImage,
        as: "images",
        where: { isPrimary: true },
        required: false,
        limit: 1,
      },
      {
        model: Inventory,
        as: "inventory",
      },
    ],
    where: { status: "active" },
    limit: parseInt(limit),
    offset: parseInt(offset),
    order: [[sort, order.toUpperCase()]],
    distinct: true,
    attributes: {
      include: [
        [
          sequelize.literal(`(
            SELECT COALESCE(AVG(rating), 0)
            FROM reviews
            WHERE reviews.product_id = Product.id
            )`),
          "averageRating",
        ],
        [
          sequelize.literal(`(
            SELECT COUNT(*)
            FROM reviews
            WHERE reviews.product_id = Product.id
            )`),
          "reviewCount",
        ],
      ],
    },
  });

  const totalPages = Math.ceil(count / limit);

  res.json({
    status: "success",
    data: {
      category,
      products,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: count,
        itemsPerPage: parseInt(limit),
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    },
  });
});
