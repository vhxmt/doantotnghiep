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
  Plus,
  Phone,
  MapPin,
} from "lucide-react";
import { formatPrice } from "../../data/mockData";
import { orderAPI } from "../../services/api";
import toast from "react-hot-toast";

const StaffOrders = () => {// funtion component để xây dựng giao diện, xử lý logic cho chức năng staff quản lý đơn
  // toàn bộ state qly đơn hàng sẽ dc đặt trong component
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  // true khi component render lần dầu, hệ thống chưa có dữ liệu
  // chuẩn bị gọi api nên giao diện cần trạng thái loading để thông báo ng dùng là đang tải dữ liệu
  // false: sau khi api trả dữ liệu thành công or thất bại
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  // quản lý việc hiển thị modal cập nhật trạng thái đơn
  // khi admin nhấn nút chỉnh sửa trạng thái,state này bật lên(true)
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("");
  // lưu trạng thái mới mà staff lựa chọn trong modal
  const [isUpdating, setIsUpdating] = useState(false);
// quản lý trạng thái trogg quá trình cập nhật đơn 
  useEffect(() => {
    fetchOrders();
  }, [sortBy, sortOrder]);

  const fetchOrders = async () => {// fetchOrder giao tiếp be
    try {
      setIsLoading(true);

      // Fetch orders from API
      const response = await orderAPI.getAllOrders({
        // Hàm fetchOrders dùng để gọi API backend lấy danh sách đơn hàng
        //theo tiêu chí phân trang và sắp xếp 
        // đẩy logic sắp xếp về be
        page: 1,
        limit: 100,
        sortBy,
        sortOrder,
      });
      // be đã trả về data ch, nếu ch thì fallback về mảng rỗng ,đảm bảo an toàn dữ liệu
      const apiOrders = response.data.data.orders || [];

      // Transform API data to match component structure
      const transformedOrders = apiOrders.map((order) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        customer: {
          firstName: order.user?.firstName || "Khách",
          lastName: order.user?.lastName || "Hàng",
          email:
            order.user?.email || order.shippingAddress?.recipientEmail || "N/A",
          phone:
            order.user?.phone || order.shippingAddress?.recipientPhone || "N/A",
        },
        status: order.status,
        total: parseFloat(order.totalAmount),
        itemCount: order.items?.length || 0,
        created_at: order.createdAt || order.created_at,
        shippingAddress: order.shippingAddress,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        items:
          order.items?.map((item) => ({
            id: item.id,
            name: item.product?.name || "Sản phẩm",
            quantity: item.quantity,
            price: parseFloat(item.unitPrice),
          })) || [],
      }));

      setOrders(transformedOrders);// cập nhật state orders để re-render giao diện với dữ liệu mới
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      toast.error("Không thể tải danh sách đơn hàng");
    } finally {
      // nếu ko tắt trạng thái loading: giao diện sẽ mãi ở trang thái loading
      // bảng đơn hàng sẽ ko hiển thị dc
      // người dùng hkhông thể tương tác dc với trang
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await orderAPI.updateOrderStatus(orderId, newStatus);
      setOrders(
        orders.map((order) => // dùng map để duyệt qua mảng các đơn hàng
        // đơn hàng có id trùng với orderId thì mới thay đổi trạng thái
        // các đơn hàng khác sữ giữ nguyên 
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
      toast.success("Cập nhật trạng thái thành công");
    } catch (error) {
      toast.error("Không thể cập nhật trạng thái");
    }
  };

  const statusFlow = [
    "pending", 
    "confirmed",
    "packing",
    "shipping",
    "delivered",
  ];

  const getNextStatusForOrder = (currentStatus) => {
    const currentIndex = statusFlow.indexOf(currentStatus);
    if (currentIndex === -1 || currentIndex >= statusFlow.length - 1)
      return null;
    return statusFlow[currentIndex + 1];
  };
 // openStatusModal nhận tham số orderId và currentStatus
 // để xác định đơn hàng nào cần cập nhật trạng thái
  const openStatusModal = (orderId, currentStatus) => {
    setSelectedOrderId(orderId); // lưu id đơn hàng đc chọn
    // gọi hàm getNextStatusForOrder nhận tham số currentStatus
    // để biết đc trạng thái cập nhật tiếp theo là gì dựa vào currenStatus
    // trạng thái tiếp theo đó lưu vào nextStatus
    const nextStatus = getNextStatusForOrder(currentStatus);
    // cập nhật lại state selectedStatus
    // nếu nextStatus tồn tại thì gán nextStatus
    // nếu ko tồn tại (đơn đã ở trạng thái cuối cùng) thì giữ nguyên currentStatus
    setSelectedStatus(nextStatus || currentStatus);
    // mở modal cập nhật trạng thái cho staff cập nhật
    setIsStatusModalOpen(true);
  };

  const handleUpdateStatus = async () => {
    if (!selectedStatus || !selectedOrderId) {
      toast.error("Vui lòng chọn trạng thái");
      return;
    }

    const currentOrder = orders.find((o) => o.id === selectedOrderId);
    if (selectedStatus === currentOrder?.status) {
      toast.error("Trạng thái không thay đổi");
      return;
    }

    try {
      setIsUpdating(true);
      await orderAPI.updateOrderStatus(selectedOrderId, selectedStatus);
      setOrders(
        orders.map((order) =>
          order.id === selectedOrderId
            ? { ...order, status: selectedStatus }
            : order
        )
      );
      toast.success("Cập nhật trạng thái thành công");
      setIsStatusModalOpen(false);
    } catch (error) {
      console.error("Failed to update status:", error);
      toast.error("Không thể cập nhật trạng thái");
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      `${order.customer.firstName} ${order.customer.lastName}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      order.customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.phone.includes(searchQuery);
    const matchesStatus = !statusFilter || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusConfig = (status) => {
    const configs = {
      pending: {
        color: "yellow",
        text: "Chờ xử lý",
        icon: Clock,
        bgColor: "bg-yellow-100",
        textColor: "text-yellow-800",
      },
      confirmed: {
        color: "blue",
        text: "Đã xác nhận",
        icon: CheckCircle,
        bgColor: "bg-blue-100",
        textColor: "text-blue-800",
      },
      packing: {
        color: "indigo",
        text: "Đang đóng gói",
        icon: Package,
        bgColor: "bg-indigo-100",
        textColor: "text-indigo-800",
      },
      shipping: {
        color: "purple",
        text: "Đang giao hàng",
        icon: Truck,
        bgColor: "bg-purple-100",
        textColor: "text-purple-800",
      },
      delivered: {
        color: "green",
        text: "Đã giao hàng",
        icon: CheckCircle,
        bgColor: "bg-green-100",
        textColor: "text-green-800",
      },
      cancelled: {
        color: "red",
        text: "Đã hủy",
        icon: XCircle,
        bgColor: "bg-red-100",
        textColor: "text-red-800",
      },
    };
    return configs[status] || configs.pending;
  };

  const getStatusBadge = (status) => {
    const config = getStatusConfig(status);
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bgColor} ${config.textColor}`}
      >
        <Icon className="w-3 h-3 mr-1" />
        {config.text}
      </span>
    );
  };

  const getPaymentBadge = (method, status) => {
    const methodConfig = {
      cod: {
        text: "💵 Tiền mặt",
        bgClass: "bg-gray-100",
        textClass: "text-gray-800",
      },
      vnpay: {
        text: "💳 VNPAY",
        bgClass: "bg-blue-100",
        textClass: "text-blue-800",
      },
      zalopay: {
        text: "💳 ZaloPay",
        bgClass: "bg-blue-100",
        textClass: "text-blue-800",
      },
      stripe: {
        text: "💳 Stripe",
        bgClass: "bg-purple-100",
        textClass: "text-purple-800",
      },
      online: {
        text: "💳 Online",
        bgClass: "bg-green-100",
        textClass: "text-green-800",
      },
      bank: {
        text: "🏦 Chuyển khoản",
        bgClass: "bg-green-100",
        textClass: "text-green-800",
      },
    };

    const statusConfig = {
      unpaid: { text: "Chưa thanh toán", color: "text-yellow-600" },
      paid: { text: "Đã thanh toán", color: "text-green-600" },
      refunded: { text: "Đã hoàn tiền", color: "text-blue-600" },
      failed: { text: "Thanh toán thất bại", color: "text-red-600" },
    };

    const config = methodConfig[method] || methodConfig.cod;
    const paymentStatus = statusConfig[status] || statusConfig.unpaid;

    return (
      <div className="space-y-1">
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bgClass} ${config.textClass}`}
        >
          {config.text}
        </span>
        <div className={`text-xs ${paymentStatus.color}`}>
          {status === "paid" ? "✓ " : ""}{paymentStatus.text}
        </div>
      </div>
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

  const getNextStatus = (currentStatus) => {
    const statusFlow = {
      pending: "processing",
      processing: "shipping",
      shipping: "delivered",
    };
    return statusFlow[currentStatus];
  };

  const getStatusAction = (status) => {
    const actions = {
      pending: { text: "Xử lý", color: "blue" },
      processing: { text: "Giao hàng", color: "purple" },
      shipping: { text: "Hoàn thành", color: "green" },
    };
    return actions[status];
  };

  const OrderRow = ({ order }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <ShoppingCart className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {order.orderNumber}
            </h3>
            <div className="flex items-center space-x-4 mt-1">
              <div className="flex items-center text-sm text-gray-500">
                <Calendar className="w-4 h-4 mr-1" />
                {formatDate(order.created_at)}
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <Package className="w-4 h-4 mr-1" />
                {order.itemCount} sản phẩm
              </div>
            </div>
          </div>
        </div>
        <div className="text-right">
          {getStatusBadge(order.status)}
          <div className="text-lg font-bold text-gray-900 mt-1">
            {formatPrice(order.total)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Customer Info */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3 flex items-center">
            <User className="w-4 h-4 mr-2" />
            Thông tin khách hàng
          </h4>
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium">
                {order.customer.firstName} {order.customer.lastName}
              </span>
            </div>
            <div className="flex items-center text-gray-600">
              <Phone className="w-4 h-4 mr-2" />
              {order.customer.phone}
            </div>
            <div className="text-gray-600">{order.customer.email}</div>
          </div>
        </div>

        {/* Shipping Address */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3 flex items-center">
            <MapPin className="w-4 h-4 mr-2" />
            Địa chỉ giao hàng
          </h4>
          <div className="text-sm text-gray-600">
            <div className="font-medium">
              {order.shippingAddress.recipientName}
            </div>
            <div>{order.shippingAddress.recipientPhone}</div>
            <div>{order.shippingAddress.addressLine1}</div>
            <div>
              {order.shippingAddress.ward}, {order.shippingAddress.district},{" "}
              {order.shippingAddress.city}
            </div>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="mt-6">
        <h4 className="font-medium text-gray-900 mb-3">Sản phẩm đã đặt</h4>
        <div className="space-y-2">
          {order.items?.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                  <Package className="w-4 h-4 text-gray-600" />
                </div>
                <div>
                  <span className="font-medium text-gray-900">{item.name}</span>
                  <span className="text-gray-500 ml-2">x{item.quantity}</span>
                </div>
              </div>
              <span className="font-medium text-gray-900">
                {formatPrice(item.price * item.quantity)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Info */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div>{getPaymentBadge(order.paymentMethod, order.paymentStatus)}</div>
          <div className="flex items-center space-x-3">
            <Link
              to={`/staff/orders/${order.id}`}
              className="btn btn-outline btn-sm flex items-center space-x-2"
            >
              <Eye className="w-4 h-4" />
              <span>Chi tiết</span>
            </Link>

            {order.status !== "delivered" && order.status !== "cancelled" && (
              <button
                onClick={() => openStatusModal(order.id, order.status)}
                className="btn btn-primary btn-sm flex items-center space-x-2"
              >
                <Package className="w-4 h-4" />
                <span>Xử lý</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
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
            Xử lý và theo dõi đơn hàng của khách hàng
          </p>
        </div>
        <Link
          to="/staff/create-order"
          className="btn btn-primary flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo đơn hàng</span>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm đơn hàng, khách hàng, SĐT..."
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
              <option value="delivered">Đã giao</option>
              <option value="cancelled">Đã hủy</option>
            </select>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <ShoppingCart className="w-8 h-8 text-gray-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Tổng đơn</p>
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
            <CheckCircle className="w-8 h-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Đã xác nhận</p>
              <p className="text-2xl font-bold text-gray-900">
                {orders.filter((o) => o.status === "confirmed").length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <Package className="w-8 h-8 text-indigo-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Đang đóng gói</p>
              <p className="text-2xl font-bold text-gray-900">
                {orders.filter((o) => o.status === "packing").length}
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
            <XCircle className="w-8 h-8 text-red-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Đã hủy</p>
              <p className="text-2xl font-bold text-gray-900">
                {orders.filter((o) => o.status === "cancelled").length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div>
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => (
            <OrderRow key={order.id} order={order} />
          ))
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Không tìm thấy đơn hàng nào</p>
          </div>
        )}
      </div>

      {/* Status Update Modal */}
      {isStatusModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={() => setIsStatusModalOpen(false)}
          />
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Cập nhật trạng thái đơn hàng
            </h3>

            {/* Hiển thị trạng thái hiện tại */}
            {(() => {
              const currentOrder = orders.find((o) => o.id === selectedOrderId);
              if (!currentOrder) return null;
              const config = getStatusConfig(currentOrder.status);
              const Icon = config.icon;
              return (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">
                    Trạng thái hiện tại:
                  </p>
                  <div className="flex items-center">
                    <Icon className={`w-5 h-5 mr-2 ${config.textColor}`} />
                    <span className={`font-medium ${config.textColor}`}>
                      {config.text}
                    </span>
                  </div>
                </div>
              );
            })()}

            <div className="space-y-3 mb-6">
              {/* Chỉ hiển thị trạng thái tiếp theo */}
              {(() => {
                const currentOrder = orders.find((o) => o.id === selectedOrderId);
                if (!currentOrder) return null;
                const nextStatus = getNextStatusForOrder(currentOrder.status);

                if (nextStatus) {
                  const config = getStatusConfig(nextStatus);
                  const Icon = config.icon;
                  return (
                    <>
                      <p className="text-sm text-gray-600">
                        Chuyển sang trạng thái:
                      </p>
                      <button
                        onClick={() => setSelectedStatus(nextStatus)}
                        className={`w-full flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                          selectedStatus === nextStatus
                            ? `${config.bgColor} border-${config.color}-500`
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-10 h-10 rounded-full ${config.bgColor} flex items-center justify-center`}
                          >
                            <Icon className={`w-5 h-5 ${config.textColor}`} />
                          </div>
                          <div className="text-left">
                            <p className={`font-medium ${config.textColor}`}>
                              {config.text}
                            </p>
                          </div>
                        </div>
                        {selectedStatus === nextStatus && (
                          <CheckCircle className={`w-5 h-5 ${config.textColor}`} />
                        )}
                      </button>
                    </>
                  );
                }
                return null;
              })()}

              {/* Hoặc cho phép hủy đơn (nếu đơn chưa giao) */}
              {(() => {
                const currentOrder = orders.find((o) => o.id === selectedOrderId);
                if (!currentOrder || currentOrder.status === "delivered" || currentOrder.status === "cancelled") {
                  return null;
                }
                const config = getStatusConfig("cancelled");
                const Icon = config.icon;
                return (
                  <>
                    <p className="text-sm text-gray-600">Hoặc:</p>
                    <button
                      onClick={() => setSelectedStatus("cancelled")}
                      className={`w-full flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                        selectedStatus === "cancelled"
                          ? "bg-red-50 border-red-500"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                          <Icon className="w-5 h-5 text-red-600" />
                        </div>
                        <div className="text-left">
                          <p className={`font-medium ${selectedStatus === "cancelled" ? "text-red-800" : "text-gray-900"}`}>
                            Hủy đơn hàng
                          </p>
                        </div>
                      </div>
                      {selectedStatus === "cancelled" && (
                        <CheckCircle className="w-5 h-5 text-red-600" />
                      )}
                    </button>
                  </>
                );
              })()}
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsStatusModalOpen(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                disabled={isUpdating}
              >
                Hủy
              </button>
              <button
                onClick={handleUpdateStatus}
                disabled={isUpdating || !selectedStatus}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUpdating ? "Đang cập nhật..." : "Cập nhật"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffOrders;
