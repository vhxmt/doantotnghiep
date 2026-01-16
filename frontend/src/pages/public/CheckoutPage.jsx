import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCartStore } from "../../store/cartStore";
import { useAuthStore } from "../../store/authStore";
import { formatPrice } from "../../data/mockData";
import { orderAPI, zalopayAPI } from "../../services/api";
import {
  ArrowLeft,
  MapPin,
  Phone,
  Mail,
  CreditCard,
  Truck,
  Package,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const { items, getSubtotal, getTotal, coupon, clearCart } = useCartStore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    // Customer info
    firstName: "",
    lastName: "",
    email: "",
    phone: "",

    // Shipping address
    addressLine1: "",
    ward: "",
    district: "",
    city: "",

    // Payment
    paymentMethod: "cod",

    // Notes
    notes: "",
  });

  useEffect(() => {
    // Redirect if cart is empty
    if (items.length === 0) {
      navigate("/cart");
      return;
    }

    // Pre-fill form if user is logged in
    if (isAuthenticated && user) {
      setFormData((prev) => ({
        ...prev,
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
      }));
    }
  }, [items.length, navigate, isAuthenticated, user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (items.length === 0) {
      toast.error("Giỏ hàng trống");
      return;
    }

    setIsSubmitting(true);

    try {
      const orderData = {
        // Customer info
        customerName: `${formData.firstName} ${formData.lastName}`,
        customerEmail: formData.email,
        customerPhone: formData.phone,

        // Shipping address
        shippingAddress: {
          recipientName: `${formData.firstName} ${formData.lastName}`,
          recipientPhone: formData.phone,
          addressLine1: formData.addressLine1,
          ward: formData.ward,
          district: formData.district,
          city: formData.city,
        },

        // Order items
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
        })),

        // Payment and totals
        paymentMethod: formData.paymentMethod,
        subtotal: getSubtotal(),
        shippingFee: 30000, // Fixed shipping fee
        total: getTotal() + 30000, // Add shipping to total
        notes: formData.notes || "",

        // Coupon if applied
        ...(coupon && {
          couponCode: coupon.code,
          discountAmount: getSubtotal() - getTotal(),
        }),
      };

      console.log("Creating order:", orderData);

      // Handle VNPAY payment
      if (formData.paymentMethod === "vnpay") {
        const response = await orderAPI.createOrderWithVNPay(orderData);
        console.log("Order with VNPAY created:", response.data);

        // Clear cart before redirecting to payment
        clearCart();

        // Redirect to VNPAY payment page
        const paymentUrl =
          response.data?.data?.paymentUrl || response.data?.paymentUrl;
        if (paymentUrl) {
          console.log("Redirecting to VNPAY:", paymentUrl);
          window.location.href = paymentUrl;
        } else {
          console.error("No payment URL in response:", response.data);
          toast.error("Không thể tạo link thanh toán");
        }
        return;
      }

      // Handle ZaloPay payment
      if (formData.paymentMethod === "zalopay") {
        // First create the order with COD method (will update to zalopay after)
        const createResponse = await orderAPI.createOrder({
          ...orderData,
          paymentMethod: "zalopay",
        });
        console.log("Order created:", createResponse.data);

        const orderId = createResponse.data?.data?.order?.id;
        if (!orderId) {
          toast.error("Không thể tạo đơn hàng");
          return;
        }

        // Create ZaloPay payment
        const zalopayResponse = await zalopayAPI.createOrder(orderId);
        console.log("ZaloPay order created:", zalopayResponse.data);

        // Clear cart before redirecting to payment
        clearCart();

        // Redirect to ZaloPay payment page
        const orderUrl = zalopayResponse.data?.data?.order_url;
        if (orderUrl) {
          console.log("Redirecting to ZaloPay:", orderUrl);
          window.location.href = orderUrl;
        } else {
          console.error("No payment URL in response:", zalopayResponse.data);
          toast.error("Không thể tạo link thanh toán ZaloPay");
        }
        return;
      }

      // Handle COD payment
      const response = await orderAPI.createOrder(orderData);
      console.log("Order created:", response.data);

      // Clear cart after successful order
      clearCart();

      toast.success("Đặt hàng thành công!");

      // Redirect to order confirmation or orders page
      if (isAuthenticated) {
        navigate("/customer/orders");
      } else {
        navigate("/products");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error(error.response?.data?.message || "Không thể đặt hàng");
    } finally {
      setIsSubmitting(false);
    }
  };

  const subtotal = getSubtotal();
  const shippingFee = 30000;
  const total = getTotal() + shippingFee;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center mb-8">
        <button
          onClick={() => navigate("/cart")}
          className="mr-4 p-2 text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Thanh toán</h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
      >
        {/* Left Column - Customer Info & Shipping */}
        <div className="lg:col-span-2 space-y-8">
          {/* Customer Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <Mail className="w-5 h-5 mr-2" />
              Thông tin khách hàng
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Họ *
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên *
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số điện thoại *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="input pl-10"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              Địa chỉ giao hàng
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Địa chỉ cụ thể *
                </label>
                <input
                  type="text"
                  name="addressLine1"
                  value={formData.addressLine1}
                  onChange={handleInputChange}
                  className="input"
                  placeholder="Số nhà, tên đường..."
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phường/Xã *
                  </label>
                  <input
                    type="text"
                    name="ward"
                    value={formData.ward}
                    onChange={handleInputChange}
                    className="input"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quận/Huyện *
                  </label>
                  <input
                    type="text"
                    name="district"
                    value={formData.district}
                    onChange={handleInputChange}
                    className="input"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tỉnh/Thành phố *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="input"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <CreditCard className="w-5 h-5 mr-2" />
              Phương thức thanh toán
            </h2>

            <div className="space-y-4">
              <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cod"
                  checked={formData.paymentMethod === "cod"}
                  onChange={handleInputChange}
                  className="mr-4"
                />
                <Truck className="w-5 h-5 text-gray-600 mr-3" />
                <div>
                  <div className="font-medium text-gray-900">
                    Thanh toán khi nhận hàng (COD)
                  </div>
                  <div className="text-sm text-gray-500">
                    Thanh toán bằng tiền mặt khi nhận hàng
                  </div>
                </div>
              </label>

              {/* <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="vnpay"
                  checked={formData.paymentMethod === "vnpay"}
                  onChange={handleInputChange}
                  className="mr-4"
                />
                <CreditCard className="w-5 h-5 text-gray-600 mr-3" />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">
                    Thanh toán qua VNPAY
                  </div>
                  <div className="text-sm text-gray-500">
                    Thẻ ATM, Visa, MasterCard, JCB, QR Code
                  </div>
                </div>
                <img
                  src="https://vnpay.vn/s1/statics.vnpay.vn/2023/9/06ncktiwd6dc1694418196384.png"
                  alt="VNPAY"
                  className="h-8"
                />
              </label> */}

              <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="zalopay"
                  checked={formData.paymentMethod === "zalopay"}
                  onChange={handleInputChange}
                  className="mr-4"
                />
                <CreditCard className="w-5 h-5 text-blue-600 mr-3" />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">
                    Thanh toán qua ZaloPay
                  </div>
                  <div className="text-sm text-gray-500">
                    Ví ZaloPay, Thẻ ATM, Visa, MasterCard
                  </div>
                </div>
                <img
                  src="https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-ZaloPay-Square.png"
                  alt="ZaloPay"
                  className="h-8"
                />
              </label>
            </div>
          </div>

          {/* Order Notes */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Ghi chú đơn hàng
            </h2>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              className="input resize-none"
              rows={4}
              placeholder="Ghi chú thêm cho đơn hàng (tùy chọn)..."
            />
          </div>
        </div>

        {/* Right Column - Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <Package className="w-5 h-5 mr-2" />
              Đơn hàng của bạn
            </h2>

            {/* Order Items */}
            <div className="space-y-4 mb-6">
              {items.map((item) => (
                <div
                  key={item.productId}
                  className="flex items-center space-x-3"
                >
                  <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={item.image || "/placeholder-product.jpg"}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 text-sm">
                      {item.name}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {item.quantity} x {formatPrice(item.price)}
                    </p>
                  </div>
                  <div className="text-sm font-medium text-gray-900">
                    {formatPrice(item.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>

            {/* Order Totals */}
            <div className="border-t border-gray-200 pt-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Tạm tính:</span>
                <span className="font-medium">{formatPrice(subtotal)}</span>
              </div>

              {coupon && (
                <div className="flex justify-between text-green-600">
                  <span>Giảm giá ({coupon.code}):</span>
                  <span>-{formatPrice(subtotal - getTotal())}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span className="text-gray-600">Phí vận chuyển:</span>
                <span className="font-medium">{formatPrice(shippingFee)}</span>
              </div>

              <div className="border-t border-gray-200 pt-3">
                <div className="flex justify-between text-lg font-bold">
                  <span>Tổng cộng:</span>
                  <span className="text-green-600">{formatPrice(total)}</span>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || items.length === 0}
              className="w-full mt-6 bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  <span>Đặt hàng</span>
                </>
              )}
            </button>

            {/* Security Notice */}
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-start">
                <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 mr-2" />
                <div className="text-xs text-blue-800">
                  <p className="font-medium mb-1">Thông tin được bảo mật</p>
                  <p>
                    Thông tin cá nhân và thanh toán của bạn được mã hóa và bảo
                    vệ an toàn.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CheckoutPage;
