import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import {
  BarChart3,
  Users,
  Package,
  FolderTree,
  ShoppingBag,
  Tag,
  Ticket,
  Star,
  FileText,
  Settings,
  X,
} from "lucide-react";
import { cn } from "../../utils/cn";

const AdminSidebar = ({ onClose }) => {
  const location = useLocation();
  const { user } = useAuthStore();

  const menuItems = [
    {
      label: "Dashboard",
      path: "/admin",
      icon: BarChart3,
      exact: true,
    },
    {
      label: "Người dùng",
      path: "/admin/users",
      icon: Users,
    },
    {
      label: "Sản phẩm",
      path: "/admin/products",
      icon: Package,
    },
    {
      label: "Danh mục",
      path: "/admin/categories",
      icon: FolderTree,
    },
    {
      label: "Đơn hàng",
      path: "/admin/orders",
      icon: ShoppingBag,
    },
    // {
    //   label: 'Mã giảm giá',
    //   path: '/admin/coupons',
    //   icon: Tag
    // },
    {
      label: "Mã giảm giá",
      path: "/admin/coupons",
      icon: Ticket,
    },
    {
      label: "Đánh giá",
      path: "/admin/reviews",
      icon: Star,
    },
    {
      label: "Báo cáo",
      path: "/admin/reports",
      icon: FileText,
    },
  ];

  const isActive = (path, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            {/* <div className="flex items-center space-x-2 mb-2">
              <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">BH</span>
              </div>
              <span className="text-lg font-bold text-gray-900">Admin Panel</span>
            </div> */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {user?.firstName?.charAt(0)}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500">Quản trị viên</p>
              </div>
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
      <nav className="flex-1 p-4 overflow-y-auto">
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
          <p>Admin Dashboard v1.0</p>
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar;
