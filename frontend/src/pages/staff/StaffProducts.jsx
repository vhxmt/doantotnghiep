import { useState, useEffect } from "react";
import {
  Search,
  Package,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import useProductStore from "../../store/productStore";
import { formatPrice } from "../../data/mockData";
import { productsAPI } from "../../services/api";
import toast from "react-hot-toast";

const StaffProducts = () => {// funtion component để xây dựng giao diện, xử lý logic cho chức năng quản lý trạng thái sản phẩm 
  //Em lấy dữ liệu sản phẩm và danh mục từ store useProductStore để dùng chung cho nhiều màn hình.
  const { products, categories, isLoading, fetchProducts, fetchCategories } =
    useProductStore(); // lấy đata từ store

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [stockFilter, setStockFilter] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");

  useEffect(() => {
    // Staff xem tất cả sản phẩm (không filter status)
    fetchProducts({ status: "" });
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  const filteredProducts = products.filter((product) => {
    const matchesSearch = // lọc theo tên, sku
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      !selectedCategory ||
      product.categories?.some((cat) => cat.id.toString() === selectedCategory);

    // lọc sp theo tình trạng tồn kho
    let matchesStock = true;// đảm bảo ko sd bộ lọc -> hiển thị tất cả sp

    if (stockFilter === "low") {// khi nvien chọn bộ lọc sắp hết hang
      matchesStock = // ss số lượng tồn kho với ngưỡng cảnh báo
        product.inventory?.quantity <=
        (product.inventory?.lowStockThreshold || 10);
      }
    else if (stockFilter === "out") {
      matchesStock = product.inventory?.quantity === 0;
    }
     else if (stockFilter === "in") {
      matchesStock = product.inventory?.quantity > 0;
    }
<<<<<<< HEAD

    return matchesSearch && matchesCategory && matchesStock;
=======
   // đảm bảo sp chỉ hiển thị màn hình khi đáp ứng đủ 4 điều kiện loc 
    return matchesSearch && matchesCategory && matchesStatus && matchesStock;
>>>>>>> 158c7c275ff7cea6225475c95c470c55b2133c71
  });
   // sắp xếp ds sản phẩm sau khi lọc
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];

    if (sortBy === "price") {
      aValue = parseFloat(aValue); // đổi kiểu string -> number 
      bValue = parseFloat(bValue);
    } else if (sortBy === "stock") {
      aValue = a.inventory?.quantity || 0;
      bValue = b.inventory?.quantity || 0;
    }

    if (sortOrder === "asc") { 
      return aValue > bValue ? 1 : -1; 
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const handleStatusUpdate = async (productId, newStatus) => {
    try {
     
      await productsAPI.updateProductStatus(productId, newStatus);

      // Refresh products list
      await fetchProducts({ status: "" });

      toast.success(
        `Đã cập nhật trạng thái sản phẩm thành "${getStatusText(newStatus)}"`
      );
    } catch (error) {
      console.error("Failed to update product status:", error);
      toast.error(error.response?.data?.message || "Không thể cập nhật trạng thái sản phẩm");
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      active: "Hoạt động",
      out_of_stock: "Hết hàng",
      discontinued: "Ngừng bán",
    };
    return statusMap[status] || status;
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { color: "green", text: "Hoạt động", icon: CheckCircle },
      out_of_stock: { color: "red", text: "Hết hàng", icon: AlertTriangle },
      discontinued: { color: "gray", text: "Ngừng bán", icon: XCircle },
    };

    const config = statusConfig[status] || statusConfig.out_of_stock;
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${config.color}-100 text-${config.color}-800`}
      >
        <Icon className="w-3 h-3 mr-1" />
        {config.text}
      </span>
    );
  };

  const getStockStatus = (quantity, lowStockThreshold = 10) => {
    if (quantity === 0) {
      return { color: "red", text: "Hết hàng", icon: XCircle };
    } else if (quantity <= lowStockThreshold) {
      return { color: "yellow", text: "Sắp hết", icon: AlertTriangle };
    } else {
      return { color: "green", text: "Còn hàng", icon: CheckCircle };
    }
  };

  const ProductCard = ({ product }) => {
    const stockStatus = getStockStatus(
      product.inventory?.quantity,
      product.inventory?.lowStockThreshold
    );
    const StockIcon = stockStatus.icon;

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-4">
            <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={
                  product.images?.[0]?.imageUrl || "/placeholder-product.jpg"
                }
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {product.name}
              </h3>
              <p className="text-sm text-gray-500 mb-2">SKU: {product.sku}</p>
              <div className="flex items-center space-x-2">
                {getStatusBadge(product.status)}
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${stockStatus.color}-100 text-${stockStatus.color}-800`}
                >
                  <StockIcon className="w-3 h-3 mr-1" />
                  {stockStatus.text}
                </span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold text-gray-900">
              {formatPrice(product.price)}
            </div>
            {product.comparePrice && (
              <div className="text-sm text-gray-500 line-through">
                {formatPrice(product.comparePrice)}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-600">Tồn kho</p>
            <p className="text-lg font-semibold text-gray-900">
              {product.inventory?.quantity || 0}
            </p>
            {product.inventory?.lowStockThreshold && (
              <p className="text-xs text-gray-500">
                Ngưỡng cảnh báo: {product.inventory.lowStockThreshold}
              </p>
            )}
          </div>
          <div>
            <p className="text-sm text-gray-600">Danh mục</p>
            <p className="text-sm font-medium text-gray-900">
              {product.categories?.map((cat) => cat.name).join(", ") ||
                "Chưa phân loại"}
            </p>
          </div>
        </div>

        {product.description && (
          <div className="mb-4">
            <p className="text-sm text-gray-600 line-clamp-2">
              {product.description}
            </p>
          </div>
        )}

        {/* Status Update Section */}
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 mb-2">
            Cập nhật trạng thái
          </h4>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleStatusUpdate(product.id, "active")}
              disabled={product.status === "active"}
              className={`btn btn-sm ${
                product.status === "active"
                  ? "bg-green-100 text-green-800 cursor-not-allowed"
                  : "btn-outline hover:bg-green-50"
              }`}
            >
              <CheckCircle className="w-3 h-3 mr-1" />
              Hoạt động
            </button>

            <button
              onClick={() => handleStatusUpdate(product.id, "discontinued")}
              disabled={product.status === "discontinued"}
              className={`btn btn-sm ${
                product.status === "discontinued"
                  ? "bg-gray-100 text-gray-800 cursor-not-allowed"
                  : "btn-outline hover:bg-gray-50"
              }`}
            >
              <XCircle className="w-3 h-3 mr-1" />
              Ngừng bán
            </button>

            <button
              onClick={() => handleStatusUpdate(product.id, "out_of_stock")}
              disabled={product.status === "out_of_stock"}
              className={`btn btn-sm ${
                product.status === "out_of_stock"
                  ? "bg-red-100 text-red-800 cursor-not-allowed"
                  : "btn-outline hover:bg-red-50"
              }`}
            >
              <AlertTriangle className="w-3 h-3 mr-1" />
              Hết hàng
            </button>
          </div>
        </div>

      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý sản phẩm</h1>
          <p className="text-gray-600 mt-1">
            Xem và theo dõi tình trạng sản phẩm trong kho
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input pl-10"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="input"
            >
              <option value="">Tất cả danh mục</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Stock Filter */}
          <div>
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="input"
            >
              <option value="">Tất cả tồn kho</option>
              <option value="in">Còn hàng</option>
              <option value="low">Sắp hết</option>
              <option value="out">Hết hàng</option>
            </select>
          </div>

          {/* Sort */}
          <div>
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split("-");
                setSortBy(field);
                setSortOrder(order);
              }}
              className="input"
            >
              <option value="name-asc">Tên A-Z</option>
              <option value="name-desc">Tên Z-A</option>
              <option value="price-asc">Giá thấp đến cao</option>
              <option value="price-desc">Giá cao đến thấp</option>
              <option value="stock-asc">Tồn kho ít nhất</option>
              <option value="stock-desc">Tồn kho nhiều nhất</option>
            </select>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <Package className="w-8 h-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Tổng sản phẩm</p>
              <p className="text-2xl font-bold text-gray-900">
                {products.length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Còn hàng</p>
              <p className="text-2xl font-bold text-gray-900">
                {
                  products.filter(
                    (p) =>
                      p.inventory?.quantity >
                      (p.inventory?.lowStockThreshold || 10)
                  ).length
                }
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <AlertTriangle className="w-8 h-8 text-yellow-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Sắp hết</p>
              <p className="text-2xl font-bold text-gray-900">
                {
                  products.filter((p) => {
                    const qty = p.inventory?.quantity || 0;
                    const threshold = p.inventory?.lowStockThreshold || 10;
                    return qty > 0 && qty <= threshold;
                  }).length
                }
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <XCircle className="w-8 h-8 text-red-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Hết hàng</p>
              <p className="text-2xl font-bold text-gray-900">
                {
                  products.filter((p) => (p.inventory?.quantity || 0) === 0)
                    .length
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div>
        {sortedProducts.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {sortedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Không tìm thấy sản phẩm nào</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffProducts;
