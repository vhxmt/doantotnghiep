import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Mail, CheckCircle } from "lucide-react";
import { authAPI } from "../../services/api";
import toast from "react-hot-toast";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("🔍 Form submitted, email:", email);

    if (!email) {
      toast.error("Vui lòng nhập email");
      return;
    }

    setIsLoading(true);

    try {
      console.log("📡 Calling forgot password API...");
      const response = await authAPI.forgotPassword({ email });
      console.log("✅ API Response:", response.data);
      setIsEmailSent(true);
      
      // Check if reset URL was returned (SMTP disabled mode - dev only)
      if (response.data?.data?.resetUrl) {
        // Development mode - show link directly
        console.log("🔗 Reset URL:", response.data.data.resetUrl);
        toast.success("Link khôi phục (chế độ dev)");
      } else {
        // Production mode - email sent
        toast.success("Link khôi phục đã được gửi đến email của bạn");
      }
    } catch (error) {
      console.error("❌ API Error:", error);
      const message =
        error.response?.data?.message || "Không thể gửi email khôi phục";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isEmailSent) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Email đã được gửi
              </h2>

              <p className="text-gray-600 mb-6">
                Chúng tôi đã gửi link khôi phục mật khẩu đến email:
              </p>

              <div className="bg-gray-50 rounded-lg p-3 mb-6">
                <p className="font-medium text-gray-900">{email}</p>
              </div>

              <div className="space-y-4 text-sm text-gray-600 mb-6">
                <p>
                  Vui lòng kiểm tra hộp thư đến (và cả thư mục spam) để tìm
                  email từ chúng tôi.
                </p>
                <p className="font-medium text-yellow-700 bg-yellow-50 p-3 rounded border border-yellow-200">
                  ⏰ Link khôi phục sẽ hết hạn sau <strong>10 phút</strong>
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => {
                    setIsEmailSent(false);
                    setEmail("");
                  }}
                  className="btn btn-outline w-full"
                >
                  Gửi lại email
                </button>

                <Link to="/auth/login" className="btn btn-primary w-full">
                  Quay lại đăng nhập
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex items-center justify-center mb-6">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">B</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">
              Memory Lane
            </span>
          </Link>
        </div>

        <h2 className="text-center text-3xl font-bold text-gray-900">
          Quên mật khẩu
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Nhập email để nhận hướng dẫn khôi phục mật khẩu
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <div className="mt-1 relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input pl-10"
                  placeholder="Nhập email của bạn"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-primary w-full flex items-center justify-center"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  "Gửi email khôi phục"
                )}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Hoặc</span>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-center space-x-4">
              <Link
                to="/auth/login"
                className="flex items-center text-sm text-blue-600 hover:text-blue-500"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Quay lại đăng nhập
              </Link>

              <span className="text-gray-300">|</span>

              <Link
                to="/auth/register"
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                Tạo tài khoản mới
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
