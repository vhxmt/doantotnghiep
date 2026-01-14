import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { XCircle, RefreshCw, Home, HelpCircle } from "lucide-react";

const PaymentFailure = () => {
  const [searchParams] = useSearchParams();
  const errorCode = searchParams.get("code") || "99";
  const [countdown, setCountdown] = useState(15);

  // VNPAY error codes mapping
  const errorMessages = {
    "07": "Giao dịch bị nghi ngờ gian lận",
    "09": "Thẻ/Tài khoản chưa đăng ký dịch vụ Internet Banking",
    10: "Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần",
    11: "Đã hết hạn chờ thanh toán. Xin quý khách vui lòng thực hiện lại giao dịch",
    12: "Thẻ/Tài khoản bị khóa",
    13: "Quý khách nhập sai mật khẩu xác thực giao dịch (OTP)",
    24: "Khách hàng hủy giao dịch",
    51: "Tài khoản không đủ số dư để thực hiện giao dịch",
    65: "Tài khoản đã vượt quá hạn mức giao dịch trong ngày",
    75: "Ngân hàng thanh toán đang bảo trì",
    79: "KH nhập sai mật khẩu thanh toán quá số lần quy định",
    99: "Giao dịch thất bại do lỗi không xác định",
    default: "Giao dịch không thành công. Vui lòng thử lại sau",
  };

  const errorMessage = errorMessages[errorCode] || errorMessages.default;

  useEffect(() => {
    // Countdown to redirect
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      // Redirect to cart
      window.location.href = "/cart";
    }
  }, [countdown]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          {/* Error Icon */}
          <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
            <XCircle className="w-12 h-12 text-red-600" />
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Thanh toán không thành công
          </h1>

          {/* Error Message */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600 mb-1">Mã lỗi: {errorCode}</p>
            <p className="text-base text-red-700 font-medium">{errorMessage}</p>
          </div>

          {/* Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <div className="flex items-start space-x-3">
              <HelpCircle className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-900 mb-2">
                  Một số lý do thường gặp:
                </p>
                <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                  <li>Số dư tài khoản không đủ</li>
                  <li>Thông tin thẻ không chính xác</li>
                  <li>Đã hủy giao dịch</li>
                  <li>Hết thời gian thanh toán</li>
                  <li>Lỗi kết nối ngân hàng</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Link
              to="/cart"
              className="w-full inline-flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200"
            >
              <RefreshCw className="mr-2 w-4 h-4" />
              Thử lại thanh toán
            </Link>

            <Link
              to="/"
              className="w-full inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium rounded-lg transition-colors duration-200"
            >
              <Home className="mr-2 w-4 h-4" />
              Về trang chủ
            </Link>
          </div>

          {/* Auto redirect notice */}
          <p className="text-sm text-gray-500 mt-6">
            Tự động chuyển về giỏ hàng sau {countdown} giây...
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
            </Link>{" "}
            hoặc gọi hotline{" "}
            <a
              href="tel:19001234"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              1900 1234
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailure;
