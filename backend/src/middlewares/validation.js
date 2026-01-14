import { body, param, query, validationResult } from "express-validator";
import { ValidationError } from "../utils/errors.js";

/**
 * Handle validation results
 */
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((error) => ({
      field: error.path || error.param,
      message: error.msg,
      value: error.value,
      location: error.location,
    }));

    return next(new ValidationError("Validation failed", formattedErrors));
  }

  next();
};

/**
 * User validation rules
 */
export const userValidation = {
  register: [
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Please provide a valid email"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long")
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage(
        "Password must contain at least one lowercase letter, one uppercase letter, and one number"
      ),
    body("firstName")
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage(
        "First name is required and must be less than 100 characters"
      ),
    body("lastName")
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage(
        "Last name is required and must be less than 100 characters"
      ),
    body("phone")
      .optional()
      .matches(/^[+]?[\d\s\-()]+$/)
      .withMessage("Please provide a valid phone number"),
    handleValidationErrors,
  ],

  login: [
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Please provide a valid email"),
    body("password").notEmpty().withMessage("Password is required"),
    handleValidationErrors,
  ],

  forgotPassword: [
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Please provide a valid email"),
    handleValidationErrors,
  ],

  resetPassword: [
    body("token").notEmpty().withMessage("Reset token is required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
    handleValidationErrors,
  ],

  updateProfile: [
    body("firstName")
      .optional()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage("First name must be less than 100 characters"),
    body("lastName")
      .optional()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage("Last name must be less than 100 characters"),
    body("phone")
      .optional({ values: "falsy" })
      .matches(/^[+]?[\d\s\-()]+$/)
      .withMessage("Please provide a valid phone number"),
    body("address")
      .optional({ values: "falsy" })
      .trim()
      .isLength({ max: 500 })
      .withMessage("Address must be less than 500 characters"),
    body("dateOfBirth")
      .optional({ values: "falsy" })
      .isISO8601()
      .withMessage("Date of birth must be a valid date"),
    body("gender")
      .optional({ values: "falsy" })
      .isIn(["male", "female", "other"])
      .withMessage("Gender must be male, female, or other"),
    handleValidationErrors,
  ],

  changePassword: [
    body("currentPassword")
      .notEmpty()
      .withMessage("Current password is required"),
    body("newPassword")
      .isLength({ min: 6 })
      .withMessage("New password must be at least 6 characters long")
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage(
        "New password must contain at least one lowercase letter, one uppercase letter, and one number"
      )
      .custom((value, { req }) => {
        if (value === req.body.currentPassword) {
          throw new Error(
            "New password must be different from current password"
          );
        }
        return true;
      }),
    body("confirmPassword")
      .notEmpty()
      .withMessage("Please confirm your new password")
      .custom((value, { req }) => {
        if (value !== req.body.newPassword) {
          throw new Error("Password confirmation does not match");
        }
        return true;
      }),
    handleValidationErrors,
  ],
};

/**
 * Category validation rules
 */
export const categoryValidation = {
  create: [
    body("name")
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage(
        "Category name is required and must be less than 100 characters"
      ),
    body("slug")
      .optional()
      .trim()
      .isLength({ min: 1, max: 100 })
      .matches(/^[a-z0-9-]+$/)
      .withMessage(
        "Slug must contain only lowercase letters, numbers, and hyphens"
      ),
    body("description")
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage("Description must be less than 1000 characters"),
    body("image").optional().isURL().withMessage("Image must be a valid URL"),
    body("parentId")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Parent ID must be a positive integer"),
    body("sortOrder")
      .optional()
      .isInt({ min: 0 })
      .withMessage("Sort order must be a non-negative integer"),
    body("status")
      .optional()
      .isIn(["active", "inactive"])
      .withMessage("Status must be either active or inactive"),
    handleValidationErrors,
  ],
  update: [
    body("name")
      .optional()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage("Category name must be less than 100 characters"),
    body("slug")
      .optional()
      .trim()
      .isLength({ min: 1, max: 100 })
      .matches(/^[a-z0-9-]+$/)
      .withMessage(
        "Slug must contain only lowercase letters, numbers, and hyphens"
      ),
    body("description")
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage("Description must be less than 1000 characters"),
    body("image").optional().isURL().withMessage("Image must be a valid URL"),
    body("parentId")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Parent ID must be a positive integer"),
    body("sortOrder")
      .optional()
      .isInt({ min: 0 })
      .withMessage("Sort order must be a non-negative integer"),
    body("status")
      .optional()
      .isIn(["active", "inactive"])
      .withMessage("Status must be either active or inactive"),
    handleValidationErrors,
  ],
};

export const validateCategory = categoryValidation.create;

/**
 * Product validation rules
 */
export const productValidation = {
  create: [
    body("name")
      .trim()
      .isLength({ min: 1, max: 255 })
      .withMessage(
        "Product name is required and must be less than 255 characters"
      ),
    body("sku")
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage("SKU is required and must be less than 100 characters"),
    body("price")
      .isFloat({ min: 0 })
      .withMessage("Price must be a positive number"),
    body("comparePrice")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Compare price must be a positive number"),
    body("description")
      .optional()
      .trim()
      .isLength({ max: 5000 })
      .withMessage("Description must be less than 5000 characters"),
    body("status")
      .optional()
      .isIn(["active", "out_of_stock", "discontinued"])
      .withMessage("Status must be active, out_of_stock, or discontinued"),
    body("categoryIds")
      .optional()
      .isArray()
      .withMessage("Category IDs must be an array"),
    body("categoryIds.*")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Each category ID must be a positive integer"),
    handleValidationErrors,
  ],

  update: [
    param("id")
      .isInt({ min: 1 })
      .withMessage("Product ID must be a positive integer"),
    body("name")
      .optional()
      .trim()
      .isLength({ min: 1, max: 255 })
      .withMessage("Product name must be less than 255 characters"),
    body("price")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Price must be a positive number"),
    body("comparePrice")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Compare price must be a positive number"),
    body("status")
      .optional()
      .isIn(["active", "out_of_stock", "discontinued"])
      .withMessage("Status must be active, out_of_stock, or discontinued"),
    handleValidationErrors,
  ],

  getById: [
    param("id")
      .isInt({ min: 1 })
      .withMessage("Product ID must be a positive integer"),
    handleValidationErrors,
  ],
};
