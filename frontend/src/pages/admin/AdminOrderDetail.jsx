import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Package,
  User,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  Edit,
  Printer,
  MessageSquare,
} from "lucide-react";
import { orderAPI } from "../../services/api";
import { formatPrice } from "../../data/mockData";
import toast from "react-hot-toast";

const AdminOrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  // Form state for editing order info
  const [editForm, setEditForm] = useState({
    recipientName: "",
    recipientPhone: "",
    addressLine: "",
    ward: "",
    district: "",
    city: "",
    notes: "",
  });

  useEffect(() => {
    fetchOrderDetail();
  }, [id]);

  const fetchOrderDetail = async () => {
    try {
      setIsLoading(true);
      const response = await orderAPI.getOrder(id);
      const apiOrder = response.data.data.order;

      const transformedOrder = {
        id: apiOrder.id,
        orderNumber: apiOrder.orderNumber,
        status: apiOrder.status,
        paymentStatus: apiOrder.paymentStatus,
        paymentMethod: apiOrder.paymentMethod,
        subtotal: parseFloat(apiOrder.subtotal),
        shippingAmount: parseFloat(apiOrder.shippingAmount),
        discountAmount: parseFloat(apiOrder.discountAmount || 0),
        totalAmount: parseFloat(apiOrder.totalAmount),
        notes: apiOrder.notes,
        createdAt: apiOrder.createdAt || apiOrder.created_at,
        updatedAt: apiOrder.updatedAt || apiOrder.updated_at,
        customer: {
          id: apiOrder.user?.id,
          firstName: apiOrder.user?.firstName || "Khách",
          lastName: apiOrder.user?.lastName || "Hàng",
          email: apiOrder.user?.email || "N/A",
          phone:
            apiOrder.user?.phone ||
            apiOrder.shippingAddress?.recipientPhone ||
            "N/A",
        },
        shippingAddress: apiOrder.shippingAddress,
        items:
          apiOrder.items?.map((item) => ({
            id: item.id,
            productId: item.productId,
            name: item.product?.name || "Sản phẩm",
            sku: item.product?.sku || "N/A",
            image: item.product?.images?.[0]?.imageUrl,
            quantity: item.quantity,
            unitPrice: parseFloat(item.unitPrice),
            totalPrice: parseFloat(item.totalPrice),
          })) || [],
      };

      setOrder(transformedOrder);
      setSelectedStatus(transformedOrder.status);

      // Initialize edit form with current order data
      setEditForm({
        recipientName: apiOrder.shippingAddress?.recipientName || "",
        recipientPhone: apiOrder.shippingAddress?.recipientPhone || "",
        addressLine: apiOrder.shippingAddress?.addressLine || "",
        ward: apiOrder.shippingAddress?.ward || "",
        district: apiOrder.shippingAddress?.district || "",
        city: apiOrder.shippingAddress?.city || "",
        notes: apiOrder.notes || "",
      });
    } catch (error) {
      console.error("Failed to fetch order detail:", error);
      toast.error("Không thể tải thông tin đơn hàng");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenEditModal = () => {
    // Reload current data into form
    if (order?.shippingAddress) {
      setEditForm({
        recipientName: order.shippingAddress.recipientName || "",
        recipientPhone: order.shippingAddress.recipientPhone || "",
        addressLine: order.shippingAddress.addressLine || "",
        ward: order.shippingAddress.ward || "",
        district: order.shippingAddress.district || "",
        city: order.shippingAddress.city || "",
        notes: order.notes || "",
      });
    }
    setIsEditModalOpen(true);
  };

  const handleUpdateOrderInfo = async () => {
    try {
      setIsUpdating(true);
      await orderAPI.updateOrderInfo(id, {
        shippingAddress: {
          recipientName: editForm.recipientName,
          recipientPhone: editForm.recipientPhone,
          addressLine: editForm.addressLine,
          ward: editForm.ward,
          district: editForm.district,
          city: editForm.city,
        },
        notes: editForm.notes,
      });
      toast.success("Cập nhật thông tin đơn hàng thành công");
      setIsEditModalOpen(false);
      fetchOrderDetail();
    } catch (error) {
      console.error("Failed to update order info:", error);
      toast.error(
        error.response?.data?.message || "Không thể cập nhật thông tin đơn hàng"
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedStatus || selectedStatus === order.status) {
      toast.error("Vui lòng chọn trạng thái mới");
      return;
    }

    try {
      setIsUpdating(true);
      await orderAPI.updateOrderStatus(id, selectedStatus);
      toast.success("Cập nhật trạng thái thành công");
      setIsStatusModalOpen(false);
      fetchOrderDetail();
    } catch (error) {
      console.error("Failed to update status:", error);
      toast.error("Không thể cập nhật trạng thái");
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      pending: {
        color: "yellow",
        text: "Chờ xử lý",
        icon: Clock,
        bgColor: "bg-yellow-100",
        textColor: "text-yellow-800",
        borderColor: "border-yellow-200",
      },
      confirmed: {
        color: "blue",
        text: "Đã xác nhận",
        icon: CheckCircle,
        bgColor: "bg-blue-100",
        textColor: "text-blue-800",
        borderColor: "border-blue-200",
      },
      packing: {
        color: "indigo",
        text: "Đang đóng gói",
        icon: Package,
        bgColor: "bg-indigo-100",
        textColor: "text-indigo-800",
        borderColor: "border-indigo-200",
      },
      shipping: {
        color: "purple",
        text: "Đang giao hàng",
        icon: Truck,
        bgColor: "bg-purple-100",
        textColor: "text-purple-800",
        borderColor: "border-purple-200",
      },
      delivered: {
        color: "green",
        text: "Đã giao hàng",
        icon: CheckCircle,
        bgColor: "bg-green-100",
        textColor: "text-green-800",
        borderColor: "border-green-200",
      },
      cancelled: {
        color: "red",
        text: "Đã hủy",
        icon: XCircle,
        bgColor: "bg-red-100",
        textColor: "text-red-800",
        borderColor: "border-red-200",
      },
    };
    return configs[status] || configs.pending;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const statusFlow = [
    "pending",
    "confirmed",
    "packing",
    "shipping",
    "delivered",
  ];

  // Lấy trạng thái tiếp theo có thể chuyển đến
  const getNextStatus = () => {
    if (!order) return null;
    const currentIndex = statusFlow.indexOf(order.status);
    if (currentIndex === -1 || currentIndex >= statusFlow.length - 1)
      return null;
    return statusFlow[currentIndex + 1];
  };

  const nextStatus = getNextStatus();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Không tìm thấy đơn hàng
        </h3>
        <Link to="/admin/orders" className="text-blue-600 hover:text-blue-800">
          ← Quay lại danh sách
        </Link>
      </div>
    );
  }

  const statusConfig = getStatusConfig(order.status);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate("/admin/orders")}
            className="p-2 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Chi tiết đơn hàng
            </h1>
            <p className="text-gray-600 mt-1">{order.orderNumber}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {order.status !== "cancelled" && order.status !== "delivered" && (
            <button
              onClick={() => setIsStatusModalOpen(true)}
              className="btn btn-primary flex items-center space-x-2"
            >
              <Edit className="w-4 h-4" />
              <span>Cập nhật trạng thái</span>
            </button>
          )}
        </div>
      </div>

      {/* Status Timeline - same as Staff */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">
          Trạng thái đơn hàng
        </h2>
        <div className="flex items-center justify-between">
          {statusFlow.map((status, index) => {
            const config = getStatusConfig(status);
            const Icon = config.icon;
            const isActive = statusFlow.indexOf(order.status) >= index;
            const isCurrent = order.status === status;

            return (
              <div key={status} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      isActive ? config.bgColor : "bg-gray-100"
                    } ${
                      isCurrent
                        ? "ring-4 ring-offset-2 " + config.borderColor
                        : ""
                    }`}
                  >
                    <Icon
                      className={`w-6 h-6 ${
                        isActive ? config.textColor : "text-gray-400"
                      }`}
                    />
                  </div>
                  <span
                    className={`text-sm font-medium mt-2 ${
                      isActive ? "text-gray-900" : "text-gray-400"
                    }`}
                  >
                    {config.text}
                  </span>
                </div>
                {index < statusFlow.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-4 ${
                      statusFlow.indexOf(order.status) > index
                        ? config.bgColor
                        : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
        {order.status === "cancelled" && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <XCircle className="w-5 h-5 text-red-600 mr-2" />
              <span className="font-medium text-red-800">
                Đơn hàng đã bị hủy
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Info */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2" />
              Thông tin khách hàng
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600">Họ tên:</label>
                <p className="font-medium text-gray-900">
                  {order.customer.firstName} {order.customer.lastName}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Số điện thoại:</label>
                <p className="font-medium text-gray-900 flex items-center">
                  <Phone className="w-4 h-4 mr-2 text-gray-400" />
                  {order.customer.phone}
                </p>
              </div>
              <div className="md:col-span-2">
                <label className="text-sm text-gray-600">Email:</label>
                <p className="font-medium text-gray-900 flex items-center">
                  <Mail className="w-4 h-4 mr-2 text-gray-400" />
                  {order.customer.email}
                </p>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                Địa chỉ giao hàng
              </h3>
              <button
                onClick={handleOpenEditModal}
                className="text-blue-600 hover:text-blue-700 text-sm flex items-center space-x-1"
              >
                <Edit className="w-4 h-4" />
                <span>Chỉnh sửa</span>
              </button>
            </div>
            <div className="space-y-2">
              <p className="font-medium text-gray-900">
                {order.shippingAddress?.recipientName}
              </p>
              <p className="text-gray-600 flex items-center">
                <Phone className="w-4 h-4 mr-2" />
                {order.shippingAddress?.recipientPhone}
              </p>
              <p className="text-gray-600">
                {order.shippingAddress?.addressLine1}
              </p>
              <p className="text-gray-600">
                {order.shippingAddress?.ward}, {order.shippingAddress?.district}
              </p>
              <p className="text-gray-600">{order.shippingAddress?.city}</p>
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Package className="w-5 h-5 mr-2" />
              Sản phẩm đã đặt
            </h3>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center space-x-4 py-4 border-b border-gray-100 last:border-b-0"
                >
                  <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{item.name}</h4>
                    <p className="text-sm text-gray-500">SKU: {item.sku}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {formatPrice(item.unitPrice)} x {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {formatPrice(item.totalPrice)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {order.notes && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <MessageSquare className="w-5 h-5 mr-2" />
                Ghi chú
              </h3>
              <p className="text-gray-600">{order.notes}</p>
            </div>
          )}
        </div>

        {/* Right Column - Summary */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Tóm tắt đơn hàng
            </h3>

            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tạm tính:</span>
                <span className="font-medium">
                  {formatPrice(order.subtotal)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Phí vận chuyển:</span>
                <span className="font-medium">
                  {formatPrice(order.shippingAmount)}
                </span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Giảm giá:</span>
                  <span>-{formatPrice(order.discountAmount)}</span>
                </div>
              )}
              <div className="border-t border-gray-200 pt-3">
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-900">
                    Tổng cộng:
                  </span>
                  <span className="font-bold text-lg text-green-600">
                    {formatPrice(order.totalAmount)}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-gray-200">
              <div>
                <label className="text-sm text-gray-600">
                  Phương thức thanh toán:
                </label>
                <p className="font-medium text-gray-900">
                  {order.paymentMethod === "cod" && "💵 Tiền mặt (COD)"}
                  {order.paymentMethod === "vnpay" && "💳 VNPAY"}
                  {!["cod", "vnpay"].includes(order.paymentMethod) &&
                    order.paymentMethod}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-600">
                  Trạng thái thanh toán:
                </label>
                <div className="mt-1">
                  {order.paymentStatus === "paid" ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      ✓ Đã thanh toán
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                      ⏳ Chưa thanh toán
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-gray-200 mt-4">
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="w-4 h-4 mr-2" />
                <div>
                  <p>Ngày đặt:</p>
                  <p className="font-medium text-gray-900">
                    {formatDate(order.createdAt)}
                  </p>
                </div>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="w-4 h-4 mr-2" />
                <div>
                  <p>Cập nhật:</p>
                  <p className="font-medium text-gray-900">
                    {formatDate(order.updatedAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Update Modal */}
      {isStatusModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={() => setIsStatusModalOpen(false)}
          />

          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Cập nhật trạng thái đơn hàng
              </h3>

              {/* Hiển thị trạng thái hiện tại */}
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">
                  Trạng thái hiện tại:
                </p>
                <div className="flex items-center">
                  {(() => {
                    const config = getStatusConfig(order.status);
                    const Icon = config.icon;
                    return (
                      <>
                        <Icon className={`w-5 h-5 mr-2 ${config.textColor}`} />
                        <span className={`font-medium ${config.textColor}`}>
                          {config.text}
                        </span>
                      </>
                    );
                  })()}
                </div>
              </div>

              <div className="space-y-3 mb-6">
                {/* Chỉ hiển thị trạng thái tiếp theo */}
                {nextStatus && (
                  <>
                    <p className="text-sm text-gray-600">
                      Chuyển sang trạng thái:
                    </p>
                    {(() => {
                      const config = getStatusConfig(nextStatus);
                      const Icon = config.icon;
                      return (
                        <label
                          className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                            selectedStatus === nextStatus
                              ? config.borderColor + " " + config.bgColor
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <input
                            type="radio"
                            name="status"
                            value={nextStatus}
                            checked={selectedStatus === nextStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="mr-3"
                          />
                          <Icon
                            className={`w-5 h-5 mr-3 ${
                              selectedStatus === nextStatus
                                ? config.textColor
                                : "text-gray-400"
                            }`}
                          />
                          <span
                            className={`font-medium ${
                              selectedStatus === nextStatus
                                ? config.textColor
                                : "text-gray-700"
                            }`}
                          >
                            {config.text}
                          </span>
                        </label>
                      );
                    })()}
                  </>
                )}

                {/* Luôn hiển thị tùy chọn hủy đơn */}
                <div className="border-t border-gray-200 pt-3 mt-3">
                  <p className="text-sm text-gray-600 mb-2">Hoặc:</p>
                  <label
                    className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedStatus === "cancelled"
                        ? "border-red-200 bg-red-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="status"
                      value="cancelled"
                      checked={selectedStatus === "cancelled"}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="mr-3"
                    />
                    <XCircle
                      className={`w-5 h-5 mr-3 ${
                        selectedStatus === "cancelled"
                          ? "text-red-600"
                          : "text-gray-400"
                      }`}
                    />
                    <span
                      className={`font-medium ${
                        selectedStatus === "cancelled"
                          ? "text-red-800"
                          : "text-gray-700"
                      }`}
                    >
                      Hủy đơn hàng
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setIsStatusModalOpen(false)}
                  className="flex-1 btn btn-outline"
                  disabled={isUpdating}
                >
                  Đóng
                </button>
                <button
                  onClick={handleUpdateStatus}
                  className="flex-1 btn btn-primary"
                  disabled={isUpdating || selectedStatus === order.status}
                >
                  {isUpdating ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                      Đang xử lý...
                    </div>
                  ) : (
                    "Cập nhật"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Order Info Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={() => setIsEditModalOpen(false)}
          />

          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Chỉnh sửa thông tin đơn hàng
              </h3>

              <div className="space-y-4 mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tên người nhận
                    </label>
                    <input
                      type="text"
                      value={editForm.recipientName}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          recipientName: e.target.value,
                        })
                      }
                      className="input w-full"
                      placeholder="Nhập tên người nhận"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Số điện thoại
                    </label>
                    <input
                      type="tel"
                      value={editForm.recipientPhone}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          recipientPhone: e.target.value,
                        })
                      }
                      className="input w-full"
                      placeholder="Nhập số điện thoại"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Địa chỉ chi tiết
                  </label>
                  <input
                    type="text"
                    value={editForm.addressLine}
                    onChange={(e) =>
                      setEditForm({ ...editForm, addressLine: e.target.value })
                    }
                    className="input w-full"
                    placeholder="Số nhà, tên đường..."
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phường/Xã
                    </label>
                    <input
                      type="text"
                      value={editForm.ward}
                      onChange={(e) =>
                        setEditForm({ ...editForm, ward: e.target.value })
                      }
                      className="input w-full"
                      placeholder="Phường/Xã"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quận/Huyện
                    </label>
                    <input
                      type="text"
                      value={editForm.district}
                      onChange={(e) =>
                        setEditForm({ ...editForm, district: e.target.value })
                      }
                      className="input w-full"
                      placeholder="Quận/Huyện"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tỉnh/Thành phố
                    </label>
                    <input
                      type="text"
                      value={editForm.city}
                      onChange={(e) =>
                        setEditForm({ ...editForm, city: e.target.value })
                      }
                      className="input w-full"
                      placeholder="Tỉnh/Thành phố"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ghi chú
                  </label>
                  <textarea
                    value={editForm.notes}
                    onChange={(e) =>
                      setEditForm({ ...editForm, notes: e.target.value })
                    }
                    className="input w-full"
                    rows="3"
                    placeholder="Ghi chú cho đơn hàng..."
                  />
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 btn btn-outline"
                  disabled={isUpdating}
                >
                  Hủy
                </button>
                <button
                  onClick={handleUpdateOrderInfo}
                  className="flex-1 btn btn-primary"
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                      Đang xử lý...
                    </div>
                  ) : (
                    "Cập nhật"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrderDetail;
