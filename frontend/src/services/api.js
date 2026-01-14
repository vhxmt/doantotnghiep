import axios from "axios";
import { useAuthStore } from "../store/authStore";
import toast from "react-hot-toast";

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const { tokens } = useAuthStore.getState();

    if (tokens?.accessToken) {
      config.headers.Authorization = `Bearer ${tokens.accessToken}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => {
    // Check for new tokens in response headers
    const newAccessToken = response.headers["x-new-access-token"];
    const newRefreshToken = response.headers["x-new-refresh-token"];

    if (newAccessToken && newRefreshToken) {
      const { setTokens } = useAuthStore.getState();
      setTokens({
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      });
    }

    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const { tokens, logout, setTokens } = useAuthStore.getState();

      if (tokens?.refreshToken) {
        try {
          const response = await axios.post(
            `${import.meta.env.VITE_API_URL}/auth/refresh-token`,
            { refreshToken: tokens.refreshToken }
          );

          const newTokens = response.data.data.tokens;
          setTokens(newTokens);

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          console.error("Token refresh failed:", refreshError);
          logout();
          toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        }
      } else {
        logout();
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post("/auth/login", credentials),
  register: (userData) => api.post("/auth/register", userData),
  logout: () => api.post("/auth/logout"),
  refreshToken: (refreshToken) =>
    api.post("/auth/refresh-token", { refreshToken }),
  forgotPassword: (data) => api.post("/auth/forgot-password", data),
  verifyResetToken: (token) =>
    api.get(`/auth/verify-reset-token?token=${token}`),
  resetPassword: (data) => api.post("/auth/reset-password", data),
  verifyEmail: (token) => api.post("/auth/verify-email", { token }),
  resendVerification: (email) =>
    api.post("/auth/resend-verification", { email }),
  getProfile: () => api.get("/auth/profile"),
  updateProfile: (data) => api.put("/auth/profile", data),
  changePassword: (data) => api.put("/auth/change-password", data),
};

// Products API
export const productsAPI = {
  getProducts: (params) =>
    api.get("/products", {
      params,
      headers: {
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
      },
    }),
  getProduct: (id) => api.get(`/products/${id}`),
  getFeaturedProducts: (params) =>
    api.get("/products/featured", {
      params,
      headers: {
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
      },
    }),
  getProductsByCategory: (categoryId, params) =>
    api.get(`/products/category/${categoryId}`, { params }),
  createProduct: (data) => api.post("/products", data),
  updateProduct: (id, data) => api.put(`/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/products/${id}`),
  updateProductStatus: (id, status) =>
    api.patch(`/products/${id}/status`, { status }),
};

// Categories API
export const categoriesAPI = {
  getCategories: (params) => api.get("/categories", { params }),
  getCategory: (id) => api.get(`/categories/${id}`),
  getCategoryTree: () => api.get("/categories/tree"),
  createCategory: (data) => api.post("/categories", data),
  updateCategory: (id, data) => api.put(`/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/categories/${id}`),
};

// Orders API
// Cart API
export const cartAPI = {
  getCart: () => api.get("/cart"),
  addToCart: (productId, quantity) =>
    api.post("/cart/items", { productId, quantity }),
  updateCartItem: (itemId, quantity) =>
    api.put(`/cart/items/${itemId}`, { quantity }),
  removeFromCart: (itemId) => api.delete(`/cart/items/${itemId}`),
  clearCart: () => api.delete("/cart"),
  applyCoupon: (code) => api.post("/cart/coupon", { code }),
  removeCoupon: () => api.delete("/cart/coupon"),
};

// Users API (Admin)
export const usersAPI = {
  getUsers: (params) => api.get("/users", { params }),
  getUser: (id) => api.get(`/users/${id}`),
  createUser: (data) => api.post("/users", data),
  updateUser: (id, data) => api.put(`/users/${id}`, data),
  deleteUser: (id) => api.delete(`/users/${id}`),
  updateUserStatus: (id, status) =>
    api.patch(`/users/${id}/status`, { status }),
  getRoles: () => api.get("/users/roles/all"),
  assignRole: (userId, roleId) =>
    api.post(`/users/${userId}/roles`, { roleId }),
  removeRole: (userId, roleId) =>
    api.delete(`/users/${userId}/roles/${roleId}`),
};

// Coupons API
export const couponsAPI = {
  getCoupons: (params) => api.get("/coupons", { params }),
  getCoupon: (id) => api.get(`/coupons/${id}`),
  createCoupon: (data) => api.post("/coupons", data),
  updateCoupon: (id, data) => api.put(`/coupons/${id}`, data),
  updateCouponStatus: (id, status) =>
    api.patch(`/coupons/${id}/status`, { status }),
  deleteCoupon: (id) => api.delete(`/coupons/${id}`),
  validateCoupon: (code) => api.post("/coupons/validate", { code }),
  getCouponStats: () => api.get("/coupons/stats"),
};

// Reviews API
export const reviewsAPI = {
  getReviews: (params) => api.get("/reviews", { params }),
  getProductReviews: (productId, params) =>
    api.get(`/products/${productId}/reviews`, { params }),
  createReview: (data) => api.post("/reviews", data),
  updateReview: (id, data) => api.put(`/reviews/${id}`, data),
  deleteReview: (id) => api.delete(`/reviews/${id}`),
  likeReview: (id) => api.post(`/reviews/${id}/like`),
  unlikeReview: (id) => api.delete(`/reviews/${id}/like`),
};

// Upload API
export const uploadAPI = {
  uploadImage: (file, type = "general") => {
    const formData = new FormData();
    formData.append("file", file);

    return api.post(`/uploads/image?type=${type}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  uploadMultipleImages: (files, type = "general") => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });

    return api.post(`/uploads/images?type=${type}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  deleteImage: (imagePath) =>
    api.delete("/uploads/image", { data: { imagePath } }),
};

// Stats API (Admin)
export const statsAPI = {
  getDashboardStats: () => api.get("/stats/dashboard"),
  getSalesStats: (params) => api.get("/stats/sales", { params }),
  getTopProducts: (params) => api.get("/stats/top-products", { params }),
};

// Reports API (Admin)
export const reportsAPI = {
  getDashboardStats: () => api.get("/reports/dashboard"),
  getSalesReport: (params) => api.get("/reports/sales", { params }),
  getProductsReport: (params) => api.get("/reports/products", { params }),
  getUsersReport: (params) => api.get("/reports/users", { params }),
  exportSalesReport: (params) =>
    api.get("/reports/sales/export", {
      params,
      responseType: "blob",
    }),
  exportProductsReport: (params) =>
    api.get("/reports/products/export", {
      params,
      responseType: "blob",
    }),
};

// Search API
export const searchAPI = {
  search: (query, params) =>
    api.get("/search", { params: { q: query, ...params } }),
  getSearchSuggestions: (query) =>
    api.get("/search/suggestions", { params: { q: query } }),
  getPopularSearches: () => api.get("/search/popular"),
};

// Order API
export const orderAPI = {
  getMyOrders: (params) => api.get("/orders", { params }),
  getOrder: (id) => api.get(`/orders/${id}`),
  createOrder: (data) => api.post("/orders", data),
  createOrderWithVNPay: (data) => api.post("/vnpay/create_order_payment", data),
  cancelOrder: (id) => api.patch(`/orders/${id}/cancel`),
  reorder: (id) => api.post(`/orders/${id}/reorder`),
  // Admin/Staff
  getAllOrders: (params) => api.get("/orders", { params }),
  updateOrderStatus: (id, status) =>
    api.patch(`/orders/${id}/status`, { status }),
  updatePaymentStatus: (id, paymentStatus) =>
    api.patch(`/orders/${id}/payment-status`, { paymentStatus }),
  updateOrderInfo: (id, data) => api.patch(`/orders/${id}/info`, data),
};

// Review API
export const reviewAPI = {
  getProductReviews: (productId, params) =>
    api.get(`/reviews/products/${productId}/reviews`, { params }),
  createReview: (data) => api.post("/reviews", data),
  updateReview: (id, data) => api.put(`/reviews/${id}`, data),
  deleteReview: (id) => api.delete(`/reviews/${id}`),
  markHelpful: (id) => api.post(`/reviews/${id}/helpful`),
  getMyReviews: (params) => api.get("/reviews/my-reviews", { params }),
  canReview: (productId) => api.get(`/reviews/can-review/${productId}`),
  // Admin
  getAllReviews: (params) => api.get("/reviews/admin/all", { params }),
  approveReview: (id) => api.patch(`/reviews/admin/${id}/approve`),
  rejectReview: (id) => api.patch(`/reviews/admin/${id}/reject`),
  adminDeleteReview: (id) => api.delete(`/reviews/admin/${id}`),
};

export default api;
