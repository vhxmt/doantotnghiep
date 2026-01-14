import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { User, Package, Star, Settings, X } from "lucide-react";
import { cn } from "../../utils/cn";

const CustomerSidebar = ({ onClose }) => {
  const location = useLocation();
  const { user } = useAuthStore();

  const menuItems = [
    {
      label: "Tổng quan",
      path: "/customer",
      icon: User,
      exact: true,
    },
    {
      label: "Thông tin cá nhân",
      path: "/customer/profile",
      icon: Settings,
    },
    {
      label: "Đơn hàng",
      path: "/customer/orders",
      icon: Package,
    },
    {
      label: "Đánh giá",
      path: "/customer/reviews",
      icon: Star,
    },
  ];

  const isActive = (path, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-lg">
                {user?.firstName?.charAt(0)}
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                {user?.firstName} {user?.lastName}
              </h3>
              <p className="text-sm text-gray-500">Khách hàng</p>
            </div>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden p-2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path, item.exact);

            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  onClick={onClose}
                  className={cn(
                    "flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                    active
                      ? "bg-primary-50 text-primary-700 border-r-2 border-primary-500"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="text-xs text-gray-500 text-center">
          <p>Memory Lane</p>
          <p>Phiên bản 1.0.0</p>
        </div>
      </div>
    </div>
  );
};

export default CustomerSidebar;
