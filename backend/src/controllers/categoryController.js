import { Category, Product } from '../models/index.js';
import { Op } from 'sequelize';
import sequelize from '../database/config.js';

// Get all categories
export const getCategories = async (req, res) => {
  try {
  const { 
    page = 1, 
    limit = 50, 
    status = 'active',
    parent_id,
    search 
  } = req.query;

  const offset = (page - 1) * limit;
  const whereClause = {};

  // Filter by status
  if (status) {
    whereClause.status = status;
  }

  // Filter by parent_id
  if (parent_id !== undefined) {
    whereClause.parentId = parent_id === 'null' ? null : parent_id;
  }

  // Search by name
  if (search) {
    whereClause.name = {
      [Op.like]: `%${search}%`
    };
  }

  // Get categories with product count
  const categories = await Category.findAll({
    where: whereClause,
    limit: parseInt(limit),
    offset: parseInt(offset),
    order: [['sortOrder', 'ASC'], ['name', 'ASC']],
    include: [
      {
        model: Category,
        as: 'children',
        where: { status: 'active' },
        required: false,
        order: [['sortOrder', 'ASC'], ['name', 'ASC']]
      },
      {
        model: Product,
        as: 'products',
        attributes: [],
        required: false,
        through: { attributes: [] }
      }
    ],
    attributes: {
      include: [
        [
          sequelize.fn('COUNT', sequelize.fn('DISTINCT', sequelize.col('products.id'))),
          'productCount'
        ]
      ]
    },
    group: ['Category.id', 'children.id'],
    subQuery: false
  });

  // Get total count without pagination
  const count = await Category.count({
    where: whereClause
  });

  const totalPages = Math.ceil(count / limit);

  res.status(200).json({
    status: 'success',
    data: {
      categories,
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
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch categories'
    });
  }
};

// Get category by ID
export const getCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findByPk(id, {
      include: [
        {
          model: Category,
          as: 'children',
          where: { status: 'active' },
          required: false,
          order: [['sortOrder', 'ASC'], ['name', 'ASC']]
        },
        {
          model: Category,
          as: 'parent',
          required: false
        }
      ]
    });

    if (!category) {
      return res.status(404).json({
        status: 'error',
        message: 'Category not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        category
      }
    });
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch category'
    });
  }
};

// Get category by slug
export const getCategoryBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const category = await Category.findOne({
      where: { slug },
      include: [
        {
          model: Category,
          as: 'children',
          where: { status: 'active' },
          required: false,
          order: [['sortOrder', 'ASC'], ['name', 'ASC']]
        },
        {
          model: Category,
          as: 'parent',
          required: false
        }
      ]
    });

    if (!category) {
      return res.status(404).json({
        status: 'error',
        message: 'Category not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        category
      }
    });
  } catch (error) {
    console.error('Error fetching category by slug:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch category'
    });
  }
};

// Create category (Admin only)
export const createCategory = async (req, res) => {
  try {
    const category = await Category.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        category
      }
    });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create category'
    });
  }
};

// Update category (Admin only)
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findByPk(id);

    if (!category) {
      return res.status(404).json({
        status: 'error',
        message: 'Category not found'
      });
    }

    await category.update(req.body);

    res.status(200).json({
      status: 'success',
      data: {
        category
      }
    });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update category'
    });
  }
};

// Delete category (Admin only)
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findByPk(id, {
      include: [{
        model: Product,
        as: 'products'
      }]
    });

    if (!category) {
      return res.status(404).json({
        status: 'error',
        message: 'Category not found'
      });
    }

    // Check if category has children
    const childrenCount = await Category.count({
      where: { parentId: id }
    });

    if (childrenCount > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Không thể xóa danh mục có danh mục con. Vui lòng xóa các danh mục con trước.'
      });
    }

    // Check if category has products
    if (category.products && category.products.length > 0) {
      return res.status(400).json({
        status: 'error',
        message: `Không thể xóa danh mục có ${category.products.length} sản phẩm. Vui lòng xoá hoặc chuyển sản phẩm sang danh mục khác trước.`
      });
    }

    await category.destroy();

    res.json({
      status: 'success',
      message: 'Xóa danh mục thành công'
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to delete category'
    });
  }
};

// Get category tree (hierarchical structure)
export const getCategoryTree = async (req, res) => {
  try {
    const categories = await Category.findAll({
      where: {
        status: 'active',
        parentId: null
      },
      order: [['sortOrder', 'ASC'], ['name', 'ASC']],
      include: [
        {
          model: Category,
          as: 'children',
          where: { status: 'active' },
          required: false,
          order: [['sortOrder', 'ASC'], ['name', 'ASC']],
          include: [
            {
              model: Category,
              as: 'children',
              where: { status: 'active' },
              required: false,
              order: [['sortOrder', 'ASC'], ['name', 'ASC']]
            }
          ]
        }
      ]
    });

    res.status(200).json({
      status: 'success',
      data: {
        categories
      }
    });
  } catch (error) {
    console.error('Error fetching category tree:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch category tree'
    });
  }
};
