import { create } from "zustand";
import { productsAPI, categoriesAPI } from "../services/api";
import toast from "react-hot-toast";

const useProductStore = create((set, get) => ({
  // State
  products: [],
  categories: [],
  featuredProducts: [],
  currentProduct: null,
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  },
  filters: {
    category: null,
    search: "",
    sortBy: "name",
    sortOrder: "asc",
    minPrice: null,
    maxPrice: null,
    inStock: null,
  },

  // Actions
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  // Fetch all products with filters and pagination
  fetchProducts: async (params = {}) => {
    try {
      console.log("ProductStore: fetchProducts called with params:", params);
      set({ isLoading: true, error: null });

      const { filters, pagination } = get();
      const queryParams = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters,
        ...params,
        _t: Date.now(), // Cache busting parameter
        _r: Math.random(), // Additional random parameter
      };
      console.log("ProductStore: queryParams:", queryParams);

      // Remove null values, but keep empty strings (like status: '')
      Object.keys(queryParams).forEach((key) => {
        if (queryParams[key] === null) {
          delete queryParams[key];
        }
      });

      const response = await productsAPI.getProducts(queryParams);
      console.log("ProductStore: getProducts response:", response);
      console.log("ProductStore: response.data:", response.data);
      console.log("ProductStore: response.data.data:", response.data?.data);

      set({
        products: response.data.data.products,
        pagination: {
          page: response.data.data.pagination?.currentPage || 1,
          limit: response.data.data.pagination?.itemsPerPage || 12,
          total: response.data.data.pagination?.totalItems || 0,
          totalPages: response.data.data.pagination?.totalPages || 1,
        },
        isLoading: false,
      });
      console.log(
        "ProductStore: products set to:",
        response.data.data.products?.length,
        "items"
      );

      return response.data.data;
    } catch (error) {
      console.error("Failed to fetch products:", error);
      set({
        error: error.response?.data?.message || "Failed to fetch products",
        isLoading: false,
      });
      throw error;
    }
  },

  // Fetch featured products
  fetchFeaturedProducts: async () => {
    try {
      console.log("ProductStore: fetchFeaturedProducts called");
      set({ isLoading: true, error: null });

      console.log("ProductStore: calling productsAPI.getFeaturedProducts()");
      const response = await productsAPI.getFeaturedProducts();
      console.log("ProductStore: getFeaturedProducts response:", response);
      console.log("ProductStore: response.data:", response.data);
      console.log("ProductStore: response.data.data:", response.data?.data);

      set({
        featuredProducts: response.data.data.products,
        isLoading: false,
      });

      return response.data.data.products;
    } catch (error) {
      console.error("ProductStore: Failed to fetch featured products:", error);
      set({
        error:
          error.response?.data?.message || "Failed to fetch featured products",
        isLoading: false,
      });
      throw error;
    }
  },

  // Fetch categories
  fetchCategories: async () => {
    try {
      console.log("ProductStore: fetchCategories called");
      const response = await categoriesAPI.getCategories();
      console.log("ProductStore: getCategories response:", response);
      console.log("ProductStore: response.data:", response.data);
      console.log("ProductStore: response.data.data:", response.data?.data);

      set({
        categories: response.data.data.categories,
      });
      console.log(
        "ProductStore: categories set to:",
        response.data.data.categories?.length,
        "items"
      );

      return response.data.data.categories;
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      set({
        error: error.response?.data?.message || "Failed to fetch categories",
      });
      throw error;
    }
  },

  // Search products
  searchProducts: async (query) => {
    try {
      console.log("ProductStore: searchProducts called with query:", query);
      set({ isLoading: true, error: null });

      // Use the same fetchProducts method but with search query
      const state = get();
      const searchFilters = {
        ...state.filters,
        search: query,
      };

      const response = await productsAPI.getProducts({
        page: state.pagination.page,
        limit: state.pagination.limit,
        search: query,
        category: searchFilters.category,
        sortBy: searchFilters.sortBy,
        sortOrder: searchFilters.sortOrder,
        minPrice: searchFilters.minPrice,
        maxPrice: searchFilters.maxPrice,
        inStock: searchFilters.inStock,
        _t: Date.now(), // Cache busting parameter
        _r: Math.random(), // Additional random parameter
      });

      console.log("ProductStore: searchProducts response:", response);

      set({
        products: response.data.data.products,
        pagination: {
          ...state.pagination,
          total: response.data.data.total || response.data.data.products.length,
          totalPages: Math.ceil(
            (response.data.data.total || response.data.data.products.length) /
              state.pagination.limit
          ),
        },
        isLoading: false,
      });

      return response.data.data.products;
    } catch (error) {
      console.error("ProductStore: Failed to search products:", error);
      set({
        error: error.response?.data?.message || "Failed to search products",
        isLoading: false,
      });
      throw error;
    }
  },

  // Update filters
  updateFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
      pagination: { ...state.pagination, page: 1 },
    }));
  },

  // Update pagination
  updatePagination: (newPagination) => {
    set((state) => ({
      pagination: { ...state.pagination, ...newPagination },
    }));
  },

  // Reset filters
  resetFilters: () => {
    set({
      filters: {
        category: null,
        search: "",
        sortBy: "name",
        sortOrder: "asc",
        minPrice: null,
        maxPrice: null,
        inStock: null,
      },
      pagination: {
        page: 1,
        limit: 12,
        total: 0,
        totalPages: 0,
      },
    });
  },

  // Clear current product
  clearCurrentProduct: () => {
    set({ currentProduct: null });
  },

  // Fetch single product by ID
  fetchProductById: async (id) => {
    try {
      console.log("ProductStore: fetchProductById called with id:", id);
      set({ isLoading: true, error: null });

      const response = await productsAPI.getProduct(id);
      console.log("ProductStore: getProduct response:", response);
      console.log("ProductStore: response.data:", response.data);
      console.log("ProductStore: response.data.data:", response.data?.data);

      set({
        currentProduct: response.data.data.product,
        isLoading: false,
      });

      return response.data.data.product;
    } catch (error) {
      console.error("Failed to fetch product:", error);
      set({
        error: error.response?.data?.message || "Failed to fetch product",
        isLoading: false,
      });
      throw error;
    }
  },

  // Fetch single product by slug
  fetchProductBySlug: async (slug) => {
    try {
      console.log("ProductStore: fetchProductBySlug called with slug:", slug);
      set({ isLoading: true, error: null });

      const response = await productsAPI.getProduct(slug);
      console.log("ProductStore: getProduct response:", response);

      set({
        currentProduct: response.data.data.product,
        isLoading: false,
      });

      return response.data.data.product;
    } catch (error) {
      console.error("Failed to fetch product:", error);
      set({
        error: error.response?.data?.message || "Failed to fetch product",
        isLoading: false,
      });
      throw error;
    }
  },

  // Update product status
  updateProductStatus: async (productId, status) => {
    try {
      console.log("ProductStore: updateProductStatus called", {
        productId,
        status,
      });
      set({ isLoading: true, error: null });

      const response = await productsAPI.updateProductStatus(productId, status);
      console.log("ProductStore: updateProductStatus response:", response);

      // Update the product in the local state with full product data from response
      const updatedProduct = response.data.data.product;
      set((state) => ({
        products: state.products.map((product) =>
          product.id === productId ? updatedProduct : product
        ),
        isLoading: false,
      }));

      toast.success("Cập nhật trạng thái thành công");
      return response.data;
    } catch (error) {
      console.error("Failed to update product status:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to update product status";
      toast.error(errorMessage);
      set({
        error: errorMessage,
        isLoading: false,
      });
      throw error;
    }
  },

  // Create a new product
  createProduct: async (productData) => {
    try {
      set({ isLoading: true, error: null });
      const response = await productsAPI.createProduct(productData);
      toast.success("Product created successfully!");
      set({ isLoading: false });
      // Optionally, you can refetch products or add the new one to the list
      get().fetchProducts();
      return response.data.data.product;
    } catch (error) {
      console.error("Failed to create product:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to create product";
      toast.error(errorMessage);
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  // Update an existing product
  updateProduct: async (productId, productData) => {
    try {
      set({ isLoading: true, error: null });
      const response = await productsAPI.updateProduct(productId, productData);
      toast.success("Product updated successfully!");
      set((state) => ({
        products: state.products.map((p) =>
          p.id === productId ? response.data.data.product : p
        ),
        currentProduct: response.data.data.product,
        isLoading: false,
      }));
      return response.data.data.product;
    } catch (error) {
      console.error("Failed to update product:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to update product";
      toast.error(errorMessage);
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  // Delete a product
  deleteProduct: async (productId) => {
    try {
      set({ isLoading: true, error: null });
      await productsAPI.deleteProduct(productId);
      toast.success("Product deleted successfully!");
      set((state) => ({
        products: state.products.filter((p) => p.id !== productId),
        isLoading: false,
      }));
    } catch (error) {
      console.error("Failed to delete product:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to delete product";
      toast.error(errorMessage);
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  },
}));

export default useProductStore;
