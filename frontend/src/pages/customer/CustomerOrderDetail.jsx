import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Package,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  MapPin,
  Phone,
  User,
  Calendar,
  CreditCard,
  Star,
} from "lucide-react";
import { formatPrice } from "../../data/mockData";
import { orderAPI } from "../../services/api";
import toast from "react-hot-toast";

const CustomerOrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchOrderDetail();
  }, [id]);

  const createTimeline = (order) => {
    const statuses = [
      "pending",
      "confirmed",
      "packing",
      "shipping",
      "delivered",
    ];
    const statusLabels = {
      pending: {
        title: "Chờ xử lý",
        description: "Đơn hàng đang chờ xác nhận",
      },
      confirmed: {
        title: "Đã xác nhận",
        description: "Đơn hàng đã được xác nhận",
      },
      packing: {
        title: "Đang đóng gói",
        description: "Đơn hàng đang được đóng gói",
      },
      shipping: {
        title: "Đang giao hàng",
        description: "Đơn hàng đang trên đường giao",
      },
      delivered: {
        title: "Đã giao hàng",
        description: "Đơn hàng đã được giao thành công",
      },
    };

    const currentIndex = statuses.indexOf(order.status);

    return statuses.map((status, index) => ({
      status,
      title: statusLabels[status].title,
      description: statusLabels[status].description,
      completed: index <= currentIndex,
      timestamp:
        index <= currentIndex ? order.updatedAt || order.createdAt : null,
    }));
  };

  const fetchOrderDetail = async () => {
    try {
      setIsLoading(true);

      const response = await orderAPI.getOrder(id);

      if (response.data.status === "success") {
        const orderData = response.data.data.order;

        // Parse JSON fields if they are strings
        if (typeof orderData.shippingAddress === "string") {
          orderData.shippingAddress = JSON.parse(orderData.shippingAddress);
        }
        if (typeof orderData.billingAddress === "string") {
          orderData.billingAddress = JSON.parse(orderData.billingAddress);
        }

        // Create timeline from order status
        const timeline = createTimeline(orderData);

        setOrder({
          ...orderData,
          timeline,
        });
      }

      /* Mock data for reference:
      const mockOrder = {
        id: 1,
        orderNumber: 'ML1755847565747001',
        status: 'delivered',
        total: 187000,
        subtotal: 145000,
        shippingFee: 30000,
        discount: 0,
        tax: 12000,
        created_at: '2025-08-22T00:26:05.000Z',
        deliveredAt: '2025-08-22T10:30:00.000Z',
        estimatedDelivery: '2025-08-23T18:00:00.000Z',

        customer: {
          firstName: 'Khách',
          lastName: 'Hàng',
          email: 'customer@bachhoa.com',
          phone: '0123456787'
        },

        shippingAddress: {
          recipientName: 'Khách Hàng',
          recipientPhone: '0123456787',
          addressLine1: '123 Đường ABC',
          ward: 'Phường 1',
          district: 'Quận 1',
          city: 'TP.HCM'
        },

        paymentMethod: 'cod',
        paymentStatus: 'paid',

        items: [
          {
            id: 1,
            productId: 1,
            name: 'Cà chua bi',
            image: 'https://images.unsplash.com/photo-1546470427-e5ac89cd0b31?w=400',
            quantity: 2,
            price: 25000,
            total: 50000,
            canReview: true
          },
          {
            id: 2,
            productId: 2,
            name: 'Thịt ba chỉ',
            image: 'https://images.unsplash.com/photo-1588347818111-d3b9b4d0c9b5?w=400',
            quantity: 1,
            price: 120000,
            total: 120000,
            canReview: true
          }
        ],

        timeline: [
          {
            status: 'pending',
            title: 'Đơn hàng được tạo',
            description: 'Đơn hàng đã được tạo và đang chờ xử lý',
            timestamp: '2025-08-22T00:26:05.000Z',
            completed: true
          },
          {
            status: 'processing',
            title: 'Đang chuẩn bị hàng',
            description: 'Cửa hàng đang chuẩn bị sản phẩm',
            timestamp: '2025-08-22T02:00:00.000Z',
            completed: true
          },
          {
            status: 'shipping',
            title: 'Đang giao hàng',
            description: 'Đơn hàng đang được vận chuyển',
            timestamp: '2025-08-22T08:00:00.000Z',
            completed: true
          },
          {
            status: 'delivered',
            title: 'Đã giao thành công',
            description: 'Đơn hàng đã được giao đến bạn',
            timestamp: '2025-08-22T10:30:00.000Z',
            completed: true
          }
        ],

        canCancel: false,
        canReorder: true,
        canReview: true
      }
      */
    } catch (error) {
      console.error("Failed to fetch order detail:", error);
      toast.error("Không thể tải thông tin đơn hàng");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!confirm("Bạn có chắc chắn muốn hủy đơn hàng này?")) return;

    try {
      const response = await orderAPI.cancelOrder(id);
      if (response.data.status === "success") {
        setOrder((prev) => ({ ...prev, status: "cancelled", canCancel: false }));
        toast.success("Đã hủy đơn hàng thành công");
      }
    } catch (error) {
      console.error("Failed to cancel order:", error);
      toast.error(error.response?.data?.message || "Không thể hủy đơn hàng");
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: "yellow", text: "Chờ xử lý", icon: Clock },
      confirmed: { color: "blue", text: "Đã xác nhận", icon: CheckCircle },
      packing: { color: "indigo", text: "Đang đóng gói", icon: Package },
      shipping: { color: "purple", text: "Đang giao", icon: Truck },
      delivered: { color: "green", text: "Đã giao", icon: CheckCircle },
      cancelled: { color: "red", text: "Đã hủy", icon: XCircle },
      returned: { color: "orange", text: "Đã trả hàng", icon: XCircle },
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-${config.color}-100 text-${config.color}-800`}
      >
        <Icon className="w-4 h-4 mr-2" />
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

  const TimelineItem = ({ item, isLast }) => (
    <div className="flex items-start space-x-4">
      <div className="flex flex-col items-center">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center ${
            item.completed ? "bg-green-100" : "bg-gray-100"
          }`}
        >
          {item.completed ? (
            <CheckCircle className="w-4 h-4 text-green-600" />
          ) : (
            <Clock className="w-4 h-4 text-gray-400" />
          )}
        </div>
        {!isLast && (
          <div
            className={`w-0.5 h-12 mt-2 ${
              item.completed ? "bg-green-200" : "bg-gray-200"
            }`}
          />
        )}
      </div>
      <div className="flex-1 pb-8">
        <h4
          className={`font-medium ${
            item.completed ? "text-gray-900" : "text-gray-500"
          }`}
        >
          {item.title}
        </h4>
        <p className="text-sm text-gray-600 mt-1">{item.description}</p>
        {item.completed && (
          <p className="text-xs text-gray-500 mt-1">
            {formatDate(item.timestamp)}
          </p>
        )}
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

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Không tìm thấy đơn hàng</p>
        <Link to="/customer/orders" className="btn btn-primary mt-4">
          Quay lại danh sách đơn hàng
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate("/customer/orders")}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Chi tiết đơn hàng
            </h1>
            <p className="text-gray-600 mt-1">Đơn hàng #{order.orderNumber}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {getStatusBadge(order.status)}

          {order.status === "pending" && (
            <button
              onClick={handleCancelOrder}
              className="btn btn-outline btn-sm text-red-600 border-red-300 hover:bg-red-50"
            >
              Hủy đơn hàng
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Order Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Timeline */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Trạng thái đơn hàng
            </h2>
            <div>
              {order.timeline?.map((item, index) => (
                <TimelineItem
                  key={item.status}
                  item={item}
                  isLast={index === order.timeline.length - 1}
                />
              ))}
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Sản phẩm đã đặt
            </h2>
            <div className="space-y-4">
              {order.items?.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg"
                >
                  <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={
                        item.product?.images?.[0]?.imageUrl ||
                        "/placeholder-product.jpg"
                      }
                      alt={item.product?.name || item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">
                      {item.product?.name || item.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {formatPrice(Number(item.unitPrice))} x {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">
                      {formatPrice(Number(item.unitPrice) * item.quantity)}
                    </p>
                    {order.status === "delivered" && (
                      <Link
                        to={`/customer/reviews/create?product=${item.productId}&order=${order.id}`}
                        className="text-sm text-blue-600 hover:text-blue-700 flex items-center justify-end mt-1"
                      >
                        <Star className="w-3 h-3 mr-1" />
                        Đánh giá
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              Địa chỉ giao hàng
            </h2>
            <div className="space-y-2 text-gray-600">
              <div className="flex items-center">
                <User className="w-4 h-4 mr-2 text-gray-400" />
                <span className="font-medium">
                  {order.shippingAddress.recipientName}
                </span>
              </div>
              <div className="flex items-center">
                <Phone className="w-4 h-4 mr-2 text-gray-400" />
                <span>{order.shippingAddress.recipientPhone}</span>
              </div>
              <div className="flex items-start">
                <MapPin className="w-4 h-4 mr-2 text-gray-400 mt-0.5" />
                <div>
                  <div>{order.shippingAddress.addressLine1}</div>
                  <div>
                    {order.shippingAddress.ward},{" "}
                    {order.shippingAddress.district},{" "}
                    {order.shippingAddress.city}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Tóm tắt đơn hàng
            </h2>

            {/* Order Info */}
            <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="w-4 h-4 mr-2" />
                <span>Đặt hàng: {formatDate(order.created_at)}</span>
              </div>
              {order.deliveredAt && (
                <div className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  <span>Giao hàng: {formatDate(order.deliveredAt)}</span>
                </div>
              )}
              <div className="flex items-center text-sm text-gray-600">
                <CreditCard className="w-4 h-4 mr-2" />
                <span>
                  {order.paymentMethod === "cod" &&
                    "💵 Thanh toán khi nhận hàng (COD)"}
                  {order.paymentMethod === "vnpay" && "💳 Thanh toán VNPAY"}
                  {!["cod", "vnpay"].includes(order.paymentMethod) &&
                    "Thanh toán online"}
                  {order.paymentStatus === "paid" && (
                    <span className="text-green-600 ml-2">✓ Đã thanh toán</span>
                  )}
                </span>
              </div>
            </div>

            {/* Order Totals */}
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Tạm tính:</span>
                <span className="font-medium">
                  {formatPrice(Number(order.subtotal))}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Phí vận chuyển:</span>
                <span className="font-medium">
                  {formatPrice(Number(order.shippingAmount || 0))}
                </span>
              </div>

              {order.discountAmount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Giảm giá:</span>
                  <span>-{formatPrice(Number(order.discountAmount))}</span>
                </div>
              )}

              {order.taxAmount > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Thuế:</span>
                  <span className="font-medium">
                    {formatPrice(Number(order.taxAmount))}
                  </span>
                </div>
              )}

              <div className="border-t border-gray-200 pt-3">
                <div className="flex justify-between text-lg font-bold">
                  <span>Tổng cộng:</span>
                  <span className="text-green-600">
                    {formatPrice(Number(order.totalAmount))}
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerOrderDetail;
