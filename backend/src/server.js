import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import "express-async-errors";

// Import configurations and utilities
import { sequelize } from "./database/config.js";
import { globalErrorHandler } from "./utils/errors.js";
import routes from "./routes/index.js";

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

// Make io accessible to routes
app.set("io", io);

// Trust proxy (for deployment behind reverse proxy)
app.set("trust proxy", 1);

// Security middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// CORS configuration
app.use(
  cors({
    origin: [
      process.env.CORS_ORIGIN || "http://localhost:3000",
      "http://localhost:5173", // Vite dev server
      "http://127.0.0.1:3000",
      "http://127.0.0.1:5173",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Cache-Control",
      "Pragma",
    ],
  })
);

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Static files
app.use("/uploads", express.static("uploads"));

// API routes
app.use("/", routes);

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "Memory Lane API Server",
    version: "1.0.0",
    status: "running",
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    status: "error",
    message: "Route not found",
    path: req.originalUrl,
  });
});

// Global error handler
app.use(globalErrorHandler);

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Join user to their personal room for order updates
  socket.on("join-user-room", (userId) => {
    socket.join(`user-${userId}`);
    console.log(`User ${userId} joined their room`);
  });

  // Join staff to staff room for order notifications
  socket.on("join-staff-room", () => {
    socket.join("staff-room");
    console.log(`Staff member joined staff room`);
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Database connection and server startup
const PORT = process.env.PORT || 5001;

const startServer = async () => {
  try {
    // Test database connection (skip if no database available)
    try {
      await sequelize.authenticate();
      console.log("✅ Database connection established successfully");

      // Sync database (in development)
      if (process.env.NODE_ENV === "development") {
        await sequelize.sync({ alter: false });
        console.log("✅ Database synchronized");
      }
    } catch (dbError) {
      console.warn(
        "⚠️ Database connection failed, running without database:",
        dbError.message
      );
    }

    // Start server
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📱 Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(
        `🌐 CORS origin: ${process.env.CORS_ORIGIN || "http://localhost:3000"}`
      );
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED PROMISE REJECTION! 💥 Shutting down...");
  console.error(err);
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION! 💥 Shutting down...");
  console.error(err);
  process.exit(1);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("👋 SIGTERM received. Shutting down gracefully");
  server.close(() => {
    console.log("💥 Process terminated");
  });
});

process.on("SIGINT", () => {
  console.log("👋 SIGINT received. Shutting down gracefully");
  server.close(() => {
    console.log("💥 Process terminated");
  });
});

// Start the server
startServer();

export default app;
