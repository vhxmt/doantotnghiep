import { useEffect, useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircle, XCircle, Package, ArrowRight, Loader2 } from "lucide-react";
import { zalopayAPI, orderAPI } from "../../services/api";

const CheckoutResult = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading"); // loading, success, failed
  const [orderInfo, setOrderInfo] = useState(null);
  const [countdown, setCountdown] = useState(10);

  const orderId = searchParams.get("orderId");

  useEffect(() => {
    const checkPaymentStatus = async () => {
      if (!orderId) {
        setStatus("failed");
        return;
      }

      try {
        // Get order details
        const orderResponse = await orderAPI.getOrder(orderId);
        const order = orderResponse.data?.data?.order;

        if (order) {
          setOrderInfo(order);

          // Check if already paid
          if (order.paymentStatus === "paid") {
            setStatus("success");
            return;
          }

          // If payment method is ZaloPay, query ZaloPay for status
          if (order.paymentMethod === "zalopay" && order.paymentTransactionId) {
            const zalopayResponse = await zalopayAPI.queryOrder(order.paymentTransactionId);
            const queryResult = zalopayResponse.data?.data;

            if (queryResult?.return_code === 1) {
              setStatus("success");
            } else if (queryResult?.return_code === 2) {
              setStatus("failed");
            } else {
              // Payment still pending, retry after delay
              setTimeout(checkPaymentStatus, 3000);
            }
          } else {
            // Non-ZaloPay order or COD
            if (order.paymentStatus === "paid") {
              setStatus("success");
            } else if (order.paymentMethod === "cod") {
              setStatus("success"); // COD is always "success" for order creation
            } else {
              setStatus("failed");
            }
          }
        } else {
          setStatus("failed");
        }
      } catch (error) {
        console.error("Error checking payment status:", error);
        setStatus("failed");
      }
    };

    checkPaymentStatus();
  }, [orderId]);

  useEffect(() => {
    // Countdown to redirect only when status is determined
    if (status === "success" || status === "failed") {
      if (countdown > 0) {
        const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        return () => clearTimeout(timer);
      } else {
        // Redirect to orders page
        navigate("/customer/orders");
      }
    }
  }, [countdown, status, navigate]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="mx-auto w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-6">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">
              Đang kiểm tra thanh toán...
            </h1>
            <p className="text-gray-600">
              Vui lòng đợi trong khi chúng tôi xác nhận thanh toán của bạn
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
              <XCircle className="w-12 h-12 text-red-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              Thanh toán thất bại
            </h1>
            <p className="text-gray-600 mb-6">
              Đã có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại hoặc chọn phương thức thanh toán khác.
            </p>

            {orderInfo && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-600 mb-1">Mã đơn hàng</p>
                <p className="text-xl font-bold text-gray-900">{orderInfo.orderNumber}</p>
              </div>
            )}

            <div className="space-y-3">
              <Link
                to="/customer/orders"
                className="w-full inline-flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200"
              >
                Xem đơn hàng của tôi
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>

              <Link
                to="/products"
                className="w-full inline-block px-6 py-3 border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium rounded-lg transition-colors duration-200"
              >
                Tiếp tục mua sắm
              </Link>
            </div>

            <p className="text-sm text-gray-500 mt-6">
              Tự động chuyển về trang đơn hàng sau {countdown} giây...
            </p>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Cần hỗ trợ?{" "}
              <Link
                to="/contact"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Liên hệ với chúng tôi
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Thanh toán thành công!
          </h1>

          <p className="text-gray-600 mb-2">
            Đơn hàng của bạn đã được thanh toán thành công qua ZaloPay
          </p>

          {orderInfo && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600 mb-1">Mã đơn hàng</p>
              <p className="text-xl font-bold text-blue-600">{orderInfo.orderNumber}</p>
            </div>
          )}

          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <div className="flex items-start space-x-3 mb-3">
              <Package className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">
                  Đơn hàng đang được xử lý
                </p>
                <p className="text-sm text-gray-600">
                  Chúng tôi sẽ gửi email xác nhận và thông tin vận chuyển cho bạn sớm nhất
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Link
              to="/customer/orders"
              className="w-full inline-flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200"
            >
              Xem đơn hàng của tôi
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>

            <Link
              to="/products"
              className="w-full inline-block px-6 py-3 border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium rounded-lg transition-colors duration-200"
            >
              Tiếp tục mua sắm
            </Link>
          </div>

          <p className="text-sm text-gray-500 mt-6">
            Tự động chuyển về trang đơn hàng sau {countdown} giây...
          </p>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Cần hỗ trợ?{" "}
            <Link
              to="/contact"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Liên hệ với chúng tôi
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CheckoutResult;
