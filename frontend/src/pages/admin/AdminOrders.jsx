import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Filter,
  Eye,
  ShoppingCart,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  Package,
  Calendar,
  User,
  DollarSign,
} from "lucide-react";
import { orderAPI } from "../../services/api";
import { formatPrice } from "../../data/mockData";
import toast from "react-hot-toast";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");

  useEffect(() => {
    fetchOrders();
  }, [sortBy, sortOrder]);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);

      // Fetch orders from API
      const response = await orderAPI.getAllOrders({
        page: 1,
        limit: 100,
        sortBy,
        sortOrder,
      });

      const apiOrders = response.data.data.orders || [];

      // Transform API data to match component structure
      const transformedOrders = apiOrders.map((order) => {
        const shippingAddr = order.shippingAddress;
        const addressString = shippingAddr
          ? `${shippingAddr.city || ""}, ${shippingAddr.district || ""}, ${
              shippingAddr.ward || ""
            }`.trim()
          : "N/A";

        return {
          id: order.id,
          orderNumber: order.orderNumber,
          customer: {
            firstName: order.user?.firstName || "Khách",
            lastName: order.user?.lastName || "Hàng",
            email: order.user?.email || "N/A",
          },
          status: order.status,
          total: parseFloat(order.totalAmount),
          itemCount: order.items?.length || 0,
          created_at: order.createdAt || order.created_at,
          shippingAddress: addressString,
          paymentMethod: order.paymentMethod,
        };
      });

      setOrders(transformedOrders);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      toast.error("Không thể tải danh sách đơn hàng");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await orderAPI.updateOrderStatus(orderId, newStatus);
      toast.success("Cập nhật trạng thái thành công");
      fetchOrders(); // Refresh data
    } catch (error) {
      toast.error("Không thể cập nhật trạng thái");
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      `${order.customer.firstName} ${order.customer.lastName}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      order.customer.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !statusFilter || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];

    if (sortBy === "customer") {
      aValue = `${a.customer.firstName} ${a.customer.lastName}`;
      bValue = `${b.customer.firstName} ${b.customer.lastName}`;
    }

    if (sortOrder === "asc") {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: "yellow", text: "Chờ xử lý", icon: Clock },
      confirmed: { color: "blue", text: "Đã xác nhận", icon: CheckCircle },
      packing: { color: "indigo", text: "Đang đóng gói", icon: Package },
      shipping: { color: "purple", text: "Đang giao", icon: Truck },
      delivered: { color: "green", text: "Đã giao hàng", icon: CheckCircle },
      cancelled: { color: "red", text: "Đã hủy", icon: XCircle },
    };

    const config = statusConfig[status] || statusConfig.pending;
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

  const getPaymentMethodBadge = (method) => {
    const methodConfig = {
      cod: {
        color: "gray",
        text: "💵 Tiền mặt",
        bgClass: "bg-gray-100",
        textClass: "text-gray-800",
      },
      vnpay: {
        color: "blue",
        text: "💳 VNPAY",
        bgClass: "bg-blue-100",
        textClass: "text-blue-800",
      },
      online: {
        color: "green",
        text: "💳 Online",
        bgClass: "bg-green-100",
        textClass: "text-green-800",
      },
      bank: {
        color: "green",
        text: "🏦 Chuyển khoản",
        bgClass: "bg-green-100",
        textClass: "text-green-800",
      },
    };

    const config = methodConfig[method] || methodConfig.cod;

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bgClass} ${config.textClass}`}
      >
        {config.text}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const OrderRow = ({ order }) => (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">
          {order.orderNumber}
        </div>
        <div className="text-sm text-gray-500 flex items-center">
          <Calendar className="w-3 h-3 mr-1" />
          {formatDate(order.created_at)}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-8 w-8">
            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
              <User className="w-4 h-4 text-gray-600" />
            </div>
          </div>
          <div className="ml-3">
            <div className="text-sm font-medium text-gray-900">
              {order.customer.firstName} {order.customer.lastName}
            </div>
            <div className="text-sm text-gray-500">{order.customer.email}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{order.itemCount} sản phẩm</div>
        <div className="text-sm text-gray-500">{order.shippingAddress}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">
          {formatPrice(order.total)}
        </div>
        {getPaymentMethodBadge(order.paymentMethod)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {getStatusBadge(order.status)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex items-center space-x-2">
          <Link
            to={`/admin/orders/${order.id}`}
            className="text-blue-600 hover:text-blue-900"
            title="Xem chi tiết"
          >
            <Eye className="w-4 h-4" />
          </Link>
          {order.status === "pending" && (
            <button
              onClick={() => handleStatusChange(order.id, "confirmed")}
              className="text-green-600 hover:text-green-900"
              title="Xác nhận đơn hàng"
            >
              <CheckCircle className="w-4 h-4" />
            </button>
          )}
          {order.status === "confirmed" && (
            <button
              onClick={() => handleStatusChange(order.id, "packing")}
              className="text-indigo-600 hover:text-indigo-900"
              title="Đóng gói"
            >
              <Package className="w-4 h-4" />
            </button>
          )}
          {order.status === "packing" && (
            <button
              onClick={() => handleStatusChange(order.id, "shipping")}
              className="text-purple-600 hover:text-purple-900"
              title="Giao hàng"
            >
              <Truck className="w-4 h-4" />
            </button>
          )}
          {order.status === "shipping" && (
            <button
              onClick={() => handleStatusChange(order.id, "delivered")}
              className="text-green-600 hover:text-green-900"
              title="Đã giao hàng"
            >
              <CheckCircle className="w-4 h-4" />
            </button>
          )}
          {!["delivered", "cancelled"].includes(order.status) && (
            <button
              onClick={() => handleStatusChange(order.id, "cancelled")}
              className="text-red-600 hover:text-red-900"
              title="Hủy đơn hàng"
            >
              <XCircle className="w-4 h-4" />
            </button>
          )}
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
          <h1 className="text-2xl font-bold text-gray-900">Quản lý đơn hàng</h1>
          <p className="text-gray-600 mt-1">
            Quản lý và xử lý đơn hàng của khách hàng
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm đơn hàng..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input pl-10"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="pending">Chờ xử lý</option>
              <option value="confirmed">Đã xác nhận</option>
              <option value="packing">Đang đóng gói</option>
              <option value="shipping">Đang giao</option>
              <option value="delivered">Đã giao hàng</option>
              <option value="cancelled">Đã hủy</option>
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
              <option value="created_at-desc">Mới nhất</option>
              <option value="created_at-asc">Cũ nhất</option>
              <option value="total-desc">Giá trị cao</option>
              <option value="total-asc">Giá trị thấp</option>
              <option value="customer-asc">Khách hàng A-Z</option>
              <option value="customer-desc">Khách hàng Z-A</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <ShoppingCart className="w-8 h-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Tổng đơn hàng</p>
              <p className="text-2xl font-bold text-gray-900">
                {orders.length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <Clock className="w-8 h-8 text-yellow-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Chờ xử lý</p>
              <p className="text-2xl font-bold text-gray-900">
                {orders.filter((o) => o.status === "pending").length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <Truck className="w-8 h-8 text-purple-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Đang giao</p>
              <p className="text-2xl font-bold text-gray-900">
                {orders.filter((o) => o.status === "shipping").length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Đã giao</p>
              <p className="text-2xl font-bold text-gray-900">
                {orders.filter((o) => o.status === "delivered").length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <DollarSign className="w-8 h-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Doanh thu</p>
              <p className="text-lg font-bold text-gray-900">
                {formatPrice(
                  orders.reduce((sum, order) => sum + order.total, 0)
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Đơn hàng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Khách hàng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Chi tiết
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tổng tiền
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
              {sortedOrders.length > 0 ? (
                sortedOrders.map((order) => (
                  <OrderRow key={order.id} order={order} />
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Không tìm thấy đơn hàng nào</p>
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

export default AdminOrders;
