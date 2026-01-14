import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle, Package, ArrowRight } from "lucide-react";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const orderNumber = searchParams.get("order");
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    // Countdown to redirect
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      // Redirect to orders page
      window.location.href = "/customer/orders";
    }
  }, [countdown]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          {/* Success Icon */}
          <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Thanh toán thành công!
          </h1>

          {/* Description */}
          <p className="text-gray-600 mb-2">
            Đơn hàng của bạn đã được thanh toán thành công
          </p>

          {/* Order Number */}
          {orderNumber && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600 mb-1">Mã đơn hàng</p>
              <p className="text-xl font-bold text-blue-600">{orderNumber}</p>
            </div>
          )}

          {/* Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <div className="flex items-start space-x-3 mb-3">
              <Package className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">
                  Đơn hàng đang được xử lý
                </p>
                <p className="text-sm text-gray-600">
                  Chúng tôi sẽ gửi email xác nhận và thông tin vận chuyển cho
                  bạn sớm nhất
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
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

          {/* Auto redirect notice */}
          <p className="text-sm text-gray-500 mt-6">
            Tự động chuyển về trang đơn hàng sau {countdown} giây...
          </p>
        </div>

        {/* Support */}
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

export default PaymentSuccess;
