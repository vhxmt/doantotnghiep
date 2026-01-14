import { Link } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import {
  X,
  Home,
  Package,
  ShoppingCart,
  User,
  LogIn,
  UserPlus,
  FolderTree,
  Info,
  Phone,
} from "lucide-react";

const MobileMenu = ({ isOpen, onClose }) => {
  const { user, isAuthenticated, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />

      {/* Menu Panel */}
      <div className="relative w-80 h-full bg-white shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">ML</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Memory Lane</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-600 hover:text-gray-900"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Info */}
        {isAuthenticated && (
          <div className="p-4 bg-gray-50 border-b">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center">
                <span className="text-white font-medium">
                  {user?.firstName?.charAt(0)}
                </span>
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-sm text-gray-500">{user?.email}</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Links */}
        <nav className="flex-1 py-4">
          <div className="space-y-1">
            <Link
              to="/"
              onClick={onClose}
              className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-100"
            >
              <Home className="w-5 h-5" />
              <span>Trang chủ</span>
            </Link>

            <Link
              to="/products"
              onClick={onClose}
              className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-100"
            >
              <Package className="w-5 h-5" />
              <span>Sản phẩm</span>
            </Link>

            <Link
              to="/categories"
              onClick={onClose}
              className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-100"
            >
              <FolderTree className="w-5 h-5" />
              <span>Danh mục</span>
            </Link>

            <Link
              to="/about"
              onClick={onClose}
              className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-100"
            >
              <Info className="w-5 h-5" />
              <span>Giới thiệu</span>
            </Link>

            <Link
              to="/contact"
              onClick={onClose}
              className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-100"
            >
              <Phone className="w-5 h-5" />
              <span>Liên hệ</span>
            </Link>

            <Link
              to="/cart"
              onClick={onClose}
              className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-100"
            >
              <ShoppingCart className="w-5 h-5" />
              <span>Giỏ hàng</span>
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  to="/customer"
                  onClick={onClose}
                  className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-100"
                >
                  <User className="w-5 h-5" />
                  <span>Tài khoản</span>
                </Link>

                <Link
                  to="/customer/orders"
                  onClick={onClose}
                  className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-100"
                >
                  <Package className="w-5 h-5" />
                  <span>Đơn hàng</span>
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/auth/login"
                  onClick={onClose}
                  className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-100"
                >
                  <LogIn className="w-5 h-5" />
                  <span>Đăng nhập</span>
                </Link>

                <Link
                  to="/auth/register"
                  onClick={onClose}
                  className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-100"
                >
                  <UserPlus className="w-5 h-5" />
                  <span>Đăng ký</span>
                </Link>
              </>
            )}
          </div>
        </nav>

        {/* Footer */}
        {isAuthenticated && (
          <div className="border-t p-4">
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg"
            >
              Đăng xuất
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileMenu;
