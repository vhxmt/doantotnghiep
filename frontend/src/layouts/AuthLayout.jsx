import { Outlet } from "react-router-dom";
import { Link } from "react-router-dom";
import logo from "../asset/icon.png";
const AuthLayout = () => {
  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 to-primary-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-20" />
        <div className="relative z-10 flex flex-col justify-center items-center text-white p-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">
              <div
                className="rounded-lg flex items-center justify-center"
                style={{ width: 350, height: 100 }}
              >
                <img src={logo} alt="Logo" style={{ width: 60, height: 60 }} />
                Memory Lane
              </div>
            </h1>
            <p className="text-xl text-primary-100 mb-8">
              Nơi lưu giữ những kỷ niệm đẹp
            </p>
            <div className="space-y-4 text-primary-100">
              <div className="flex items-center">
                <svg
                  className="w-6 h-6 mr-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Đồ lưu niệm thủ công chính hãng
              </div>
              <div className="flex items-center">
                <svg
                  className="w-6 h-6 mr-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Giao hàng toàn cầu, đóng gói cẩn thận
              </div>
              <div className="flex items-center">
                <svg
                  className="w-6 h-6 mr-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Mang đậm bản sắc văn hóa Việt Nam
              </div>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white bg-opacity-10 rounded-full -translate-y-32 translate-x-32" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white bg-opacity-10 rounded-full translate-y-24 -translate-x-24" />
      </div>

      {/* Right Side - Auth Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          {/* Logo for mobile */}
          <div className="lg:hidden text-center mb-8">
            <Link to="/" className="inline-flex items-center">
              <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white font-bold text-lg">ML</span>
              </div>
              <span className="text-2xl font-bold text-gray-900">
                Memory Lane
              </span>
            </Link>
          </div>

          {/* Auth Form */}
          <Outlet />

          {/* Back to home link */}
          <div className="mt-8 text-center">
            <Link
              to="/"
              className="text-sm text-primary-600 hover:text-primary-500 font-medium"
            >
              ← Quay về trang chủ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
