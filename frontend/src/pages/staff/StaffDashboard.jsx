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
import { orderAPI, productsAPI } from "../../services/api";
import toast from "react-hot-toast";

const StaffDashboard = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({
    todayOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalProducts: 0,
    lowStockProducts: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);

      // Fetch orders
      const ordersResponse = await orderAPI.getAllOrders({
        page: 1,
        limit: 100,
        sortBy: 'created_at',
        sortOrder: 'desc'
      });

      if (ordersResponse.data.status === 'success') {
        const orders = ordersResponse.data.data.orders;

        // Calculate today's date at midnight
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Calculate stats
        const todayOrders = orders.filter(order => {
          const orderDate = new Date(order.createdAt || order.created_at);
          orderDate.setHours(0, 0, 0, 0);
          return orderDate.getTime() === today.getTime();
        }).length;

        const pendingOrders = orders.filter(order =>
          order.status === 'pending' ||
          order.status === 'confirmed' ||
          order.status === 'packing'
        ).length;

        const completedOrders = orders.filter(order =>
          order.status === 'delivered'
        ).length;

        // Get recent orders (top 5)
        setRecentOrders(orders.slice(0, 5));

        setStats(prevStats => ({
          ...prevStats,
          todayOrders,
          pendingOrders,
          completedOrders
        }));
      }

      // Fetch products
      const productsResponse = await productsAPI.getProducts({
        page: 1,
        limit: 1000
      });

      if (productsResponse.data.status === 'success') {
        const products = productsResponse.data.data.products;
        const totalProducts = productsResponse.data.data.pagination.totalItems;
        const lowStockProducts = products.filter(product =>
          product.inventory?.quantity < 10
        ).length;

        setStats(prevStats => ({
          ...prevStats,
          totalProducts,
          lowStockProducts
        }));
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Không thể tải dữ liệu dashboard');
    } finally {
      setIsLoading(false);
    }
  };

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

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const orderDate = new Date(date);
    orderDate.setHours(0, 0, 0, 0);

    if (orderDate.getTime() === today.getTime()) {
      return "Hôm nay";
    }
    return date.toLocaleDateString('vi-VN');
  };

  const RecentOrder = ({ order }) => (
    <div className="flex items-center justify-between p-4 border-b border-gray-100 last:border-b-0">
      <div className="flex items-center space-x-4">
        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
          <User className="w-5 h-5 text-gray-600" />
        </div>
        <div>
          <p className="font-medium text-gray-900">#{order.orderNumber}</p>
          <p className="text-sm text-gray-600">
            {order.user?.firstName} {order.user?.lastName}
          </p>
        </div>
      </div>
      <div className="text-right">
        <div
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            order.status === "pending"
              ? "bg-yellow-100 text-yellow-800"
              : order.status === "confirmed"
              ? "bg-blue-100 text-blue-800"
              : order.status === "packing"
              ? "bg-indigo-100 text-indigo-800"
              : order.status === "shipping"
              ? "bg-purple-100 text-purple-800"
              : order.status === "delivered"
              ? "bg-green-100 text-green-800"
              : order.status === "cancelled"
              ? "bg-red-100 text-red-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {order.status === "pending"
            ? "Chờ xử lý"
            : order.status === "confirmed"
            ? "Đã xác nhận"
            : order.status === "packing"
            ? "Đang đóng gói"
            : order.status === "shipping"
            ? "Đang giao"
            : order.status === "delivered"
            ? "Đã giao"
            : order.status === "cancelled"
            ? "Đã hủy"
            : order.status}
        </div>
        <p className="text-sm text-gray-600 mt-1">{formatPrice(order.totalAmount)}</p>
        <p className="text-xs text-gray-500">{formatDate(order.createdAt || order.created_at)}</p>
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
            to="/staff/create-order"
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
          value={isLoading ? "..." : stats.todayOrders}
          icon={ShoppingCart}
          color="blue"
          link="/staff/orders"
          description="Tổng đơn hàng trong ngày"
        />
        <StatCard
          title="Chờ xử lý"
          value={isLoading ? "..." : stats.pendingOrders}
          icon={Clock}
          color="yellow"
          link="/staff/orders?status=pending"
          description="Đơn hàng cần xử lý"
        />
        <StatCard
          title="Đã hoàn thành"
          value={isLoading ? "..." : stats.completedOrders}
          icon={CheckCircle}
          color="green"
          link="/staff/orders?status=delivered"
          description="Đơn hàng đã giao"
        />
        <StatCard
          title="Sản phẩm sắp hết"
          value={isLoading ? "..." : stats.lowStockProducts}
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
              link="/staff/create-order"
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
            {isLoading ? (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : recentOrders.length > 0 ? (
              recentOrders.map((order) => (
                <RecentOrder key={order.id} order={order} />
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                Chưa có đơn hàng nào
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;
