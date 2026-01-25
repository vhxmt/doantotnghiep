import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Package,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import useProductStore from "../../store/productStore";
import { formatPrice } from "../../data/mockData";
import toast from "react-hot-toast";

const AdminProducts = () => {
  const {
    products,
    categories,
    isLoading,
    fetchProducts,
    fetchCategories,
    updateProductStatus,
    deleteProduct,
  } = useProductStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");

  useEffect(() => {
   
    fetchProducts({ status: "" });
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      !selectedCategory ||
      product.categories?.some((cat) => cat.id.toString() === selectedCategory);
    const matchesStatus = !statusFilter || product.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];

    if (sortBy === "price") {
      aValue = parseFloat(aValue);
      bValue = parseFloat(bValue);
    }

    if (sortOrder === "asc") {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const handleStatusChange = async (productId, newStatus) => {
    try {
      await updateProductStatus(productId, newStatus);
      toast.success("Cập nhật trạng thái thành công");
      fetchProducts(); // Refresh data
    } catch (error) {
      toast.error("Không thể cập nhật trạng thái");
    }
  };

  const handleDelete = async (productId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này không?")) {
      try {
        await deleteProduct(productId);
         toast.success('Sản phẩm đã được xóa thành công');
        fetchProducts();
      } catch (error) {
         toast.error('Không thể xóa sản phẩm.');
        console.error("Failed to delete product:", error);
      }
    }
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

  const ProductRow = ({ product }) => (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-12 w-12">
            <img
              className="h-12 w-12 rounded-lg object-cover"
              src={product.images?.[0]?.imageUrl || "/placeholder-product.jpg"}
              alt={product.name}
            />
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">
              {product.name}
            </div>
            <div className="text-sm text-gray-500">SKU: {product.sku}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">
          {formatPrice(product.price)}
        </div>
        {product.comparePrice && (
          <div className="text-sm text-gray-500 line-through">
            {formatPrice(product.comparePrice)}
          </div>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">
          {product.inventory?.quantity || 0}
        </div>
        {(product.inventory?.quantity || 0) === 0 ? (
          <div className="text-xs text-red-600 font-medium">Hết hàng</div>
        ) : (product.inventory?.quantity || 0) <= (product.inventory?.lowStockThreshold || 0) ? (
          <div className="text-xs text-orange-600">Sắp hết hàng</div>
        ) : null}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">
          {product.categories?.map((cat) => cat.name).join(", ") ||
            "Chưa phân loại"}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {getStatusBadge(product.status)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex items-center space-x-2">
          <Link
            to={`/admin/products/${product.id}/edit`}
            className="text-indigo-600 hover:text-indigo-900"
            title="Chỉnh sửa"
          >
            <Edit className="w-4 h-4" />
          </Link>
          <button
            onClick={() => handleDelete(product.id)}
            className="text-red-600 hover:text-red-900"
            title="Xóa"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={() =>
              handleStatusChange(
                product.id,
                product.status === "active" ? "out_of_stock" : "active"
              )
            }
            className={`${
              product.status === "active"
                ? "text-red-600 hover:text-red-900"
                : "text-green-600 hover:text-green-900"
            }`}
            title={product.status === "active" ? "Hết hàng" : "Kích hoạt"}
          >
            {product.status === "active" ? (
              <XCircle className="w-4 h-4" />
            ) : (
              <CheckCircle className="w-4 h-4" />
            )}
          </button>
        </div>
      </td>
    </tr>
  );

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
            Quản lý danh sách sản phẩm trong cửa hàng
          </p>
        </div>
        <Link
          to="/admin/products/new"
          className="btn btn-primary flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm sản phẩm</span>
        </Link>
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

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="active">Hoạt động</option>
              <option value="inactive">Tạm dừng</option>
              <option value="out_of_stock">Hết hàng</option>
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
              <option value="created_at-desc">Mới nhất</option>
              <option value="created_at-asc">Cũ nhất</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
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
              <p className="text-sm font-medium text-gray-600">
                Đang hoạt động
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {products.filter((p) => p.status === "active").length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <AlertTriangle className="w-8 h-8 text-red-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Hết/Sắp hết hàng</p>
              <p className="text-2xl font-bold text-gray-900">
                {
                  products.filter(
                    (p) =>
                      (p.inventory?.quantity || 0) <=
                      (p.inventory?.lowStockThreshold || 0)
                  ).length
                }
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <XCircle className="w-8 h-8 text-gray-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Tạm dừng</p>
              <p className="text-2xl font-bold text-gray-900">
                {products.filter((p) => p.status === "out_of_stock").length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sản phẩm
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Giá
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tồn kho
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Danh mục
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedProducts.length > 0 ? (
                sortedProducts.map((product) => (
                  <ProductRow key={product.id} product={product} />
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Không tìm thấy sản phẩm nào</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminProducts;
