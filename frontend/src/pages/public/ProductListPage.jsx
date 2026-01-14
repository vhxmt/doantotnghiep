import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import useProductStore from "../../store/productStore";
import ProductCard from "../../components/ui/ProductCard";
import { Filter, Grid, List, Search } from "lucide-react";

const ProductListPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState("grid");
  const [searchInput, setSearchInput] = useState("");

  const {
    products,
    categories,
    isLoading,
    pagination,
    filters,
    fetchProducts,
    fetchCategories,
    updateFilters,
    updatePagination,
    searchProducts,
  } = useProductStore();

  // Initialize filters from URL params and fetch data
  useEffect(() => {
    const categoryParam = searchParams.get("categoryId"); // Changed from 'category' to 'categoryId'
    const searchParam = searchParams.get("q");
    const sortParam = searchParams.get("sort");

    const newFilters = {
      category: null, // Reset category by default
      search: "", // Reset search by default
    };

    if (categoryParam) {
      newFilters.category = categoryParam; // Backend expects 'category' param with ID value
    }
    if (searchParam) {
      newFilters.search = searchParam;
      setSearchInput(searchParam); // Set search input from URL
    } else {
      setSearchInput(""); // Clear search input if no query param
    }
    if (sortParam) {
      const [sortBy, sortOrder] = sortParam.split("-");
      newFilters.sortBy = sortBy;
      newFilters.sortOrder = sortOrder || "asc";
    }

    // Always update filters to ensure they match URL params
    updateFilters(newFilters);
  }, [searchParams, updateFilters]);

  // Fetch products when non-search filters change
  useEffect(() => {
    console.log(
      "ProductListPage: non-search filters changed, fetching products...",
      filters
    );
    // Only auto-fetch when category or sort changes, not search
    fetchProducts();
  }, [filters.category, filters.sortBy, filters.sortOrder, fetchProducts]);

  // Initial load
  useEffect(() => {
    console.log(
      "ProductListPage: initial load, fetching categories and products"
    );
    fetchCategories();
    fetchProducts();
  }, []);

  // Handle filter changes
  // Handle search input change (just update local state)
  const handleSearchInputChange = (e) => {
    setSearchInput(e.target.value);
  };

  // Handle search button click or Enter key
  const handleSearch = () => {
    console.log(
      "ProductListPage: handleSearch called with value:",
      searchInput
    );
    const searchTerm = searchInput.trim();
    console.log("ProductListPage: searchTerm after trim:", searchTerm);

    // Update filters
    updateFilters({ search: searchTerm });
    console.log("ProductListPage: filters updated");

    // Update URL
    const newParams = new URLSearchParams(searchParams);
    if (searchTerm) {
      newParams.set("q", searchTerm);
      console.log("ProductListPage: URL will be updated with q=", searchTerm);
    } else {
      newParams.delete("q");
      console.log("ProductListPage: q parameter will be removed from URL");
    }
    setSearchParams(newParams);

    // Perform search - pass search term directly to fetchProducts
    if (searchTerm) {
      console.log(
        "ProductListPage: calling fetchProducts with search:",
        searchTerm
      );
      fetchProducts({ search: searchTerm });
    } else {
      console.log("ProductListPage: calling fetchProducts without search");
      fetchProducts();
    }
  };

  // Handle Enter key in search input
  const handleSearchKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchInput("");
    updateFilters({ search: "" });

    const newParams = new URLSearchParams(searchParams);
    newParams.delete("q");
    setSearchParams(newParams);

    // Fetch all products without search filter
    fetchProducts();
  };

  const handleCategoryChange = (value) => {
    console.log(
      "ProductListPage: handleCategoryChange called with value:",
      value
    );
    // Empty string means "All categories"
    updateFilters({ category: value || null });

    // Update URL - use categoryId param
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set("categoryId", value); // Changed to categoryId
    } else {
      newParams.delete("categoryId"); // Changed to categoryId
    }
    setSearchParams(newParams);

    // Fetch products immediately
    fetchProducts();
  };

  const handleSortChange = (value) => {
    const [sortBy, sortOrder] = value.split("-");
    updateFilters({ sortBy, sortOrder: sortOrder || "asc" });

    // Update URL
    const newParams = new URLSearchParams(searchParams);
    newParams.set("sort", value);
    setSearchParams(newParams);

    // Fetch products immediately
    fetchProducts();
  };

  const handlePageChange = (page) => {
    updatePagination({ page });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Sản phẩm</h1>
        <p className="text-gray-600">
          Khám phá những món quà lưu niệm văn hóa Việt Nam chân thực
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          {/* Search */}
          <div className="relative flex-1 max-w-md flex">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                value={searchInput}
                onChange={handleSearchInputChange}
                onKeyPress={handleSearchKeyPress}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-blue-600 text-white border border-blue-600 rounded-r-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Tìm kiếm
            </button>
            {searchInput && (
              <button
                onClick={handleClearSearch}
                className="ml-2 px-3 py-2 text-gray-500 border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                title="Xóa tìm kiếm"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center gap-4">
            {/* Category Filter */}
            <select
              value={filters.category || ""}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Tất cả danh mục</option>
              {(categories || []).map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={`${filters.sortBy}-${filters.sortOrder}`}
              onChange={(e) => handleSortChange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="name-asc">Tên A-Z</option>
              <option value="name-desc">Tên Z-A</option>
              <option value="price-asc">Giá thấp đến cao</option>
              <option value="price-desc">Giá cao đến thấp</option>
              <option value="createdAt-desc">Mới nhất</option>
              <option value="createdAt-asc">Cũ nhất</option>
            </select>

            {/* View Mode */}
            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 ${
                  viewMode === "grid"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 ${
                  viewMode === "list"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-6">
        <p className="text-gray-600">
          Hiển thị {(products || []).length} / {pagination?.total || 0} sản phẩm
          {filters?.search && ` cho "${filters.search}"`}
          {filters?.category && ` trong danh mục "${filters.category}"`}
        </p>
      </div>

      {/* Products Grid */}
      {isLoading ? (
        <div
          className={`grid gap-6 ${
            viewMode === "grid"
              ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              : "grid-cols-1"
          }`}
        >
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl shadow-sm overflow-hidden animate-pulse"
            >
              <div className="w-full h-48 bg-gray-200"></div>
              <div className="p-4">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded mb-3"></div>
                <div className="flex items-center justify-between">
                  <div className="h-6 bg-gray-200 rounded w-20"></div>
                  <div className="h-8 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (products || []).length > 0 ? (
        <>
          <div
            className={`grid gap-6 ${
              viewMode === "grid"
                ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                : "grid-cols-1"
            }`}
          >
            {(products || []).map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                className={viewMode === "list" ? "flex flex-row" : ""}
              />
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange((pagination?.page || 1) - 1)}
                  disabled={(pagination?.page || 1) <= 1}
                  className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Trước
                </button>

                {[...Array(pagination?.totalPages || 0)].map((_, i) => {
                  const page = i + 1;
                  if (
                    page === 1 ||
                    page === (pagination?.totalPages || 0) ||
                    (page >= (pagination?.page || 1) - 2 &&
                      page <= (pagination?.page || 1) + 2)
                  ) {
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-2 border rounded-lg ${
                          page === (pagination?.page || 1)
                            ? "bg-blue-600 text-white border-blue-600"
                            : "border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {page}
                      </button>
                    );
                  } else if (
                    page === (pagination?.page || 1) - 3 ||
                    page === (pagination?.page || 1) + 3
                  ) {
                    return (
                      <span key={page} className="px-2">
                        ...
                      </span>
                    );
                  }
                  return null;
                })}

                <button
                  onClick={() => handlePageChange((pagination?.page || 1) + 1)}
                  disabled={
                    (pagination?.page || 1) >= (pagination?.totalPages || 0)
                  }
                  className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sau
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Không tìm thấy sản phẩm
          </h3>
          <p className="text-gray-500 mb-4">
            Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
          </p>
          <button
            onClick={() => {
              updateFilters({ search: "", category: null });
              setSearchParams({});
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            Xóa bộ lọc
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductListPage;
