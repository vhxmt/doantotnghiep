import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { Eye, EyeOff, CheckCircle } from "lucide-react";
import LoadingSpinner from "../../components/ui/LoadingSpinner";

const LoginPage = () => {// dùng function component để xây dựng giao diện ,xử lý logic trang đăng nhâp
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading } = useAuthStore();

  const [formData, setFormData] = useState({
    email: location.state?.email || "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState(
    location.state?.message || ""
  );

  const from = location.state?.from?.pathname || "/";

  // Clear success message after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = "Email là bắt buộc";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email không hợp lệ";
    }

    if (!formData.password) {
      newErrors.password = "Mật khẩu là bắt buộc";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const result = await login(formData);

    if (result.success) {
      // Get user data from the login result
      const user = result.user;
      const userRoles = user?.roles?.map((role) => role.name) || [];

      console.log("Login successful, user roles:", userRoles);

      if (userRoles.includes("admin")) {
        console.log("Redirecting to admin dashboard");
        navigate("/admin", { replace: true });
      } else if (userRoles.includes("staff")) {
        console.log("Redirecting to staff dashboard");
        navigate("/staff", { replace: true });
      } else if (userRoles.includes("customer")) {
        console.log("Redirecting to customer dashboard");
        navigate("/customer", { replace: true });
      } else {
        console.log("No specific role, redirecting to default");
        navigate(from, { replace: true });
      }
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Đăng nhập</h2>
        <p className="mt-2 text-gray-600">Chào mừng bạn quay trở lại</p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start space-x-3">
          <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-green-800">
              {successMessage}
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            className={`input ${errors.email ? "input-error" : ""}`}
            placeholder="Nhập email của bạn"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Mật khẩu
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleChange}
              className={`input pr-10 ${errors.password ? "input-error" : ""}`}
              placeholder="Nhập mật khẩu"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-gray-400" />
              ) : (
                <Eye className="h-4 w-4 text-gray-400" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password}</p>
          )}
        </div>

        {/* Forgot Password */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label
              htmlFor="remember-me"
              className="ml-2 block text-sm text-gray-900"
            >
              Ghi nhớ đăng nhập
            </label>
          </div>

          <Link
            to="/auth/forgot-password"
            className="text-sm text-primary-600 hover:text-primary-500"
          >
            Quên mật khẩu?
          </Link>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="btn btn-primary w-full"
        >
          {isLoading ? <LoadingSpinner size="sm" color="white" /> : "Đăng nhập"}
        </button>
      </form>

      {/* Demo Accounts */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-sm font-medium text-gray-900 mb-2">
          Tài khoản demo:
        </h3>
        <div className="space-y-1 text-xs text-gray-600">
          <p>
            <strong>Admin:</strong> admin@bachhoa.com / 123456
          </p>
          <p>
            <strong>Staff:</strong> staff@bachhoa.com / 123456
          </p>
          <p>
            <strong>Customer:</strong> customer@bachhoa.com / 123456
          </p>
        </div>
      </div>

      {/* Forgot Password Link */}
      <div className="mt-6 text-center">
        <Link
          to="/auth/forgot-password"
          className="text-sm text-blue-600 hover:text-blue-500"
        >
          Quên mật khẩu?
        </Link>
      </div>

      {/* Sign Up Link */}
      <p className="mt-4 text-center text-sm text-gray-600">
        Chưa có tài khoản?{" "}
        <Link
          to="/auth/register"
          className="font-medium text-primary-600 hover:text-primary-500"
        >
          Đăng ký ngay
        </Link>
      </p>
    </div>
  );
};

export default LoginPage;
