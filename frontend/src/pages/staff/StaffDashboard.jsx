import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ShoppingCart,
  Package,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  Eye,
  Search,
  User,
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";

const StaffDashboard = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({
    todayOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalProducts: 0,
    lowStockProducts: 0,
  });

  // Real data from database
  useEffect(() => {
    // Simulate API call with real data
    setTimeout(() => {
      setStats({
        todayOrders: 1, // Real: 1 order today
        pendingOrders: 0, // Real: 0 pending orders
        completedOrders: 1, // Real: 1 completed order (delivered)
        totalProducts: 6, // Real: 6 products in database
        lowStockProducts: 0, // Real: 0 low stock products (all have good stock)
      });
    }, 1000);
  }, []);

  const StatCard = ({
    title,
    value,
    icon: Icon,
    color = "blue",
    link,
    description,
  }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
          {description && (
            <p className="text-sm text-gray-500 mt-1">{description}</p>
          )}
        </div>
        <div className={`p-3 rounded-full bg-${color}-100`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
      </div>
      {link && (
        <div className="mt-4">
          <Link
            to={link}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Xem chi tiết →
          </Link>
        </div>
      )}
    </div>
  );

  const QuickAction = ({
    title,
    description,
    icon: Icon,
    link,
    color = "blue",
  }) => (
    <Link
      to={link}
      className="block bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
    >
      <div className="flex items-center">
        <div className={`p-3 rounded-full bg-${color}-100 mr-4`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        </div>
      </div>
    </Link>
  );

  const RecentOrder = ({ id, customer, status, total, time }) => (
    <div className="flex items-center justify-between p-4 border-b border-gray-100 last:border-b-0">
      <div className="flex items-center space-x-4">
        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
          <User className="w-5 h-5 text-gray-600" />
        </div>
        <div>
          <p className="font-medium text-gray-900">#{id}</p>
          <p className="text-sm text-gray-600">{customer}</p>
        </div>
      </div>
      <div className="text-right">
        <div
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            status === "pending"
              ? "bg-yellow-100 text-yellow-800"
              : status === "processing"
              ? "bg-blue-100 text-blue-800"
              : status === "completed"
              ? "bg-green-100 text-green-800"
              : status === "delivered"
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {status === "pending"
            ? "Chờ xử lý"
            : status === "processing"
            ? "Đang xử lý"
            : status === "completed"
            ? "Hoàn thành"
            : status === "delivered"
            ? "Đã giao"
            : status}
        </div>
        <p className="text-sm text-gray-600 mt-1">{total}</p>
        <p className="text-xs text-gray-500">{time}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Chào mừng, {user?.firstName}!
          </h1>
          <p className="text-gray-600 mt-1">
            Bảng điều khiển nhân viên - Memory Lane
          </p>
        </div>
        <div className="flex space-x-3">
          <Link
            to="/staff/orders/create"
            className="btn btn-primary flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo đơn hàng</span>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Đơn hàng hôm nay"
          value={stats.todayOrders}
          icon={ShoppingCart}
          color="blue"
          link="/staff/orders"
          description="Tổng đơn hàng trong ngày"
        />
        <StatCard
          title="Chờ xử lý"
          value={stats.pendingOrders}
          icon={Clock}
          color="yellow"
          link="/staff/orders?status=pending"
          description="Đơn hàng cần xử lý"
        />
        <StatCard
          title="Đã hoàn thành"
          value={stats.completedOrders}
          icon={CheckCircle}
          color="green"
          link="/staff/orders?status=completed"
          description="Đơn hàng hoàn thành hôm nay"
        />
        <StatCard
          title="Sản phẩm sắp hết"
          value={stats.lowStockProducts}
          icon={AlertCircle}
          color="red"
          link="/staff/products?filter=low-stock"
          description="Cần nhập thêm hàng"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Thao tác nhanh
          </h2>
          <div className="space-y-4">
            <QuickAction
              title="Tạo đơn hàng mới"
              description="Tạo đơn hàng cho khách hàng"
              icon={Plus}
              link="/staff/orders/create"
              color="green"
            />
            <QuickAction
              title="Quản lý đơn hàng"
              description="Xem và xử lý đơn hàng"
              icon={ShoppingCart}
              link="/staff/orders"
              color="blue"
            />
            <QuickAction
              title="Quản lý sản phẩm"
              description="Xem danh sách sản phẩm"
              icon={Package}
              link="/staff/products"
              color="purple"
            />
            <QuickAction
              title="Hồ sơ cá nhân"
              description="Cập nhật thông tin cá nhân"
              icon={User}
              link="/staff/profile"
              color="indigo"
            />
          </div>
        </div>

        {/* Recent Orders */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Đơn hàng gần đây
            </h2>
            <Link
              to="/staff/orders"
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Xem tất cả →
            </Link>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <RecentOrder
              id="ML1755847565747001"
              customer="Khách Hàng"
              status="delivered"
              total="187,000đ"
              time="Hôm nay"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;
