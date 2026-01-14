import multer from "multer";
import sharp from "sharp";
import path from "path";
import fs from "fs/promises";
import { v4 as uuidv4 } from "uuid";
import { ValidationError } from "../utils/errors.js";

class UploadService {
  constructor() {
    this.uploadPath = process.env.UPLOAD_PATH || "./uploads";
    this.maxFileSize = parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024; // 5MB
    this.allowedTypes = (
      process.env.ALLOWED_FILE_TYPES || "jpg,jpeg,png,gif,webp"
    ).split(",");

    this.initializeDirectories();
  }

  /**
   * Initialize upload directories
   */
  async initializeDirectories() {
    const directories = [
      this.uploadPath,
      path.join(this.uploadPath, "products"),
      path.join(this.uploadPath, "users"),
      path.join(this.uploadPath, "categories"),
      path.join(this.uploadPath, "temp"),
    ];

    for (const dir of directories) {
      try {
        await fs.access(dir);
      } catch {
        await fs.mkdir(dir, { recursive: true });
        console.log(`📁 Created directory: ${dir}`);
      }
    }
  }

  /**
   * Configure multer storage
   */
  getStorage(subfolder = "temp") {
    return multer.diskStorage({
      destination: (req, file, cb) => {
        const uploadDir = path.join(this.uploadPath, subfolder);
        cb(null, uploadDir);
      },
      filename: (req, file, cb) => {
        const uniqueName = `${uuidv4()}-${Date.now()}${path.extname(
          file.originalname
        )}`;
        cb(null, uniqueName);
      },
    });
  }

  /**
   * File filter function
   */
  fileFilter = (req, file, cb) => {
    // Check both MIME type and file extension
    const fileExt = path.extname(file.originalname).toLowerCase().slice(1);
    const mimeType = file.mimetype.toLowerCase();

    // Map of allowed MIME types
    const allowedMimeTypes = {
      "image/jpeg": ["jpg", "jpeg"],
      "image/png": ["png"],
      "image/gif": ["gif"],
      "image/webp": ["webp"],
    };

    // Check if MIME type is allowed
    const isValidMimeType = Object.keys(allowedMimeTypes).includes(mimeType);

    // Check if extension matches the MIME type
    const isValidExtension =
      isValidMimeType && allowedMimeTypes[mimeType].includes(fileExt);

    if (isValidMimeType && isValidExtension) {
      cb(null, true);
    } else {
      const allowedExtensions = Object.values(allowedMimeTypes)
        .flat()
        .join(", ");
      cb(
        new ValidationError(
          `File type not allowed. File: ${file.originalname} (${mimeType}). ` +
            `Allowed types: ${allowedExtensions}`
        ),
        false
      );
    }
  };

  /**
   * Create multer upload middleware
   */
  createUploadMiddleware(options = {}) {
    const { subfolder = "temp", maxFiles = 10, fieldName = "files" } = options;

    const upload = multer({
      storage: this.getStorage(subfolder),
      fileFilter: this.fileFilter,
      limits: {
        fileSize: this.maxFileSize,
        files: maxFiles,
      },
    });

    if (maxFiles === 1) {
      return upload.single(fieldName);
    } else {
      return upload.array(fieldName, maxFiles);
    }
  }

  /**
   * Process and optimize image
   */
  async processImage(inputPath, outputPath, options = {}) {
    const { width, height, quality = 80, format = "jpeg" } = options;

    try {
      let pipeline = sharp(inputPath);

      // Resize if dimensions provided
      if (width || height) {
        pipeline = pipeline.resize(width, height, {
          fit: "inside",
          withoutEnlargement: true,
        });
      }

      // Set format and quality
      if (format === "jpeg") {
        pipeline = pipeline.jpeg({ quality });
      } else if (format === "png") {
        pipeline = pipeline.png({ quality });
      } else if (format === "webp") {
        pipeline = pipeline.webp({ quality });
      }

      await pipeline.toFile(outputPath);

      return {
        success: true,
        path: outputPath,
        size: (await fs.stat(outputPath)).size,
      };
    } catch (error) {
      console.error("Image processing error:", error);
      throw new Error("Failed to process image");
    }
  }

  /**
   * Create multiple image sizes
   */
  async createImageVariants(inputPath, outputDir, baseName) {
    const variants = {
      thumbnail: { width: 150, height: 150 },
      small: { width: 300, height: 300 },
      medium: { width: 600, height: 600 },
      large: { width: 1200, height: 1200 },
    };

    const results = {};

    for (const [size, dimensions] of Object.entries(variants)) {
      const outputPath = path.join(outputDir, `${baseName}-${size}.jpg`);

      try {
        await this.processImage(inputPath, outputPath, {
          ...dimensions,
          quality: size === "thumbnail" ? 70 : 80,
          format: "jpeg",
        });

        results[size] = outputPath;
      } catch (error) {
        console.error(`Failed to create ${size} variant:`, error);
      }
    }

    return results;
  }

  /**
   * Upload and process single product image (without productId)
   */
  async uploadProductImage(file) {
    try {
      const tempDir = path.join(this.uploadPath, "products");
      await fs.mkdir(tempDir, { recursive: true });

      const baseName = path.parse(file.filename).name;

      // Create variants
      const variants = {};
      const sizes = {
        thumbnail: { width: 150, height: 150, quality: 70 },
        small: { width: 300, height: 300, quality: 75 },
        medium: { width: 600, height: 600, quality: 80 },
        large: { width: 1200, height: 1200, quality: 85 },
      };

      for (const [size, options] of Object.entries(sizes)) {
        const outputPath = path.join(tempDir, `${baseName}-${size}.jpg`);

        await this.processImage(file.path, outputPath, {
          width: options.width,
          height: options.height,
          quality: options.quality,
          format: "jpeg",
        });

        variants[size] = {
          path: outputPath,
          url: `/uploads/products/${baseName}-${size}.jpg`,
        };
      }

      // Clean up original file
      await fs.unlink(file.path);

      return {
        original: file.originalname,
        variants,
        primary: variants.medium || variants.large,
        thumbnail: variants.thumbnail,
      };
    } catch (error) {
      console.error("Failed to process product image:", error);
      throw error;
    }
  }

  /**
   * Upload and process category image
   */
  async uploadCategoryImage(file) {
    try {
      const tempDir = path.join(this.uploadPath, "categories");
      await fs.mkdir(tempDir, { recursive: true });

      const baseName = path.parse(file.filename).name;

      // Create variants (same as products)
      const variants = {};
      const sizes = {
        thumbnail: { width: 150, height: 150, quality: 70 },
        small: { width: 300, height: 300, quality: 75 },
        medium: { width: 600, height: 600, quality: 80 },
        large: { width: 1200, height: 1200, quality: 85 },
      };

      for (const [size, options] of Object.entries(sizes)) {
        const outputPath = path.join(tempDir, `${baseName}-${size}.jpg`);

        await this.processImage(file.path, outputPath, {
          width: options.width,
          height: options.height,
          quality: options.quality,
          format: "jpeg",
        });

        variants[size] = {
          path: outputPath,
          url: `/uploads/categories/${baseName}-${size}.jpg`,
        };
      }

      // Clean up original file
      await fs.unlink(file.path);

      return {
        original: file.originalname,
        variants,
        primary: variants.medium || variants.large,
        thumbnail: variants.thumbnail,
      };
    } catch (error) {
      console.error("Failed to process category image:", error);
      throw error;
    }
  }

  /**
   * Upload and process product images (multiple)
   */
  async uploadProductImages(files, productId) {
    const results = [];
    const productDir = path.join(
      this.uploadPath,
      "products",
      productId.toString()
    );

    // Create product directory
    await fs.mkdir(productDir, { recursive: true });

    for (const file of files) {
      try {
        const baseName = path.parse(file.filename).name;
        const variants = await this.createImageVariants(
          file.path,
          productDir,
          baseName
        );

        // Clean up original file
        await fs.unlink(file.path);

        results.push({
          original: file.originalname,
          variants,
          primary: variants.medium || variants.large,
          thumbnail: variants.thumbnail,
        });
      } catch (error) {
        console.error("Failed to process product image:", error);
        results.push({
          original: file.originalname,
          error: error.message,
        });
      }
    }

    return results;
  }

  /**
   * Upload user avatar
   */
  async uploadUserAvatar(file, userId) {
    const userDir = path.join(this.uploadPath, "users", userId.toString());
    await fs.mkdir(userDir, { recursive: true });

    const outputPath = path.join(userDir, "avatar.jpg");

    await this.processImage(file.path, outputPath, {
      width: 200,
      height: 200,
      quality: 80,
      format: "jpeg",
    });

    // Clean up original file
    await fs.unlink(file.path);

    return {
      path: outputPath,
      url: `/uploads/users/${userId}/avatar.jpg`,
    };
  }

  /**
   * Delete file or directory
   */
  async deleteFile(filePath) {
    try {
      await fs.unlink(filePath);
      return true;
    } catch (error) {
      console.error("Failed to delete file:", error);
      return false;
    }
  }

  /**
   * Delete directory and all contents
   */
  async deleteDirectory(dirPath) {
    try {
      await fs.rm(dirPath, { recursive: true, force: true });
      return true;
    } catch (error) {
      console.error("Failed to delete directory:", error);
      return false;
    }
  }

  /**
   * Get file info
   */
  async getFileInfo(filePath) {
    try {
      const stats = await fs.stat(filePath);
      return {
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime,
        isFile: stats.isFile(),
        isDirectory: stats.isDirectory(),
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * Clean up temporary files older than specified time
   */
  async cleanupTempFiles(maxAge = 24 * 60 * 60 * 1000) {
    // 24 hours
    const tempDir = path.join(this.uploadPath, "temp");

    try {
      const files = await fs.readdir(tempDir);
      const now = Date.now();
      let deletedCount = 0;

      for (const file of files) {
        const filePath = path.join(tempDir, file);
        const stats = await fs.stat(filePath);

        if (now - stats.mtime.getTime() > maxAge) {
          await fs.unlink(filePath);
          deletedCount++;
        }
      }

      console.log(`🧹 Cleaned up ${deletedCount} temporary files`);
      return deletedCount;
    } catch (error) {
      console.error("Failed to cleanup temp files:", error);
      return 0;
    }
  }

  /**
   * Get upload statistics
   */
  async getUploadStats() {
    const stats = {
      totalFiles: 0,
      totalSize: 0,
      byType: {},
    };

    const scanDirectory = async (dir) => {
      try {
        const items = await fs.readdir(dir, { withFileTypes: true });

        for (const item of items) {
          const itemPath = path.join(dir, item.name);

          if (item.isDirectory()) {
            await scanDirectory(itemPath);
          } else if (item.isFile()) {
            const fileStats = await fs.stat(itemPath);
            const ext = path.extname(item.name).toLowerCase();

            stats.totalFiles++;
            stats.totalSize += fileStats.size;
            stats.byType[ext] = (stats.byType[ext] || 0) + 1;
          }
        }
      } catch (error) {
        // Ignore errors for inaccessible directories
      }
    };

    await scanDirectory(this.uploadPath);
    return stats;
  }
}

// Create singleton instance
const uploadService = new UploadService();

export default uploadService;
