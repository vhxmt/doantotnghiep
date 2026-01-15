import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ShoppingCart,
  Package,
  Star,
  Clock,
  User,
  CreditCard,
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { formatPrice } from "../../data/mockData";
import { orderAPI } from "../../services/api";
import toast from "react-hot-toast";

const CustomerDashboard = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalSpent: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);

        // Fetch all orders to calculate stats
        const response = await orderAPI.getMyOrders({
          limit: 100,
          page: 1,
          sortBy: 'createdAt',
          sortOrder: 'desc'
        });

        if (response.data.status === 'success') {
          const orders = response.data.data.orders;

          // Calculate stats
          const totalOrders = response.data.data.pagination.totalItems;
          const pendingOrders = orders.filter(order =>
            order.status === 'pending' || order.status === 'confirmed' || order.status === 'packing'
          ).length;
          const completedOrders = orders.filter(order =>
            order.status === 'delivered'
          ).length;
          const totalSpent = orders.reduce((sum, order) =>
            sum + Number(order.totalAmount || 0), 0
          );

          setStats({
            totalOrders,
            pendingOrders,
            completedOrders,
            totalSpent
          });

          // Set recent orders (top 3)
          setRecentOrders(orders.slice(0, 3));
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Không thể tải dữ liệu dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.id) {
      fetchDashboardData();
    }
  }, [user?.id]);

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

  const RecentOrder = ({ id, status, total, items, date }) => (
    <div className="flex items-center justify-between p-4 border-b border-gray-100 last:border-b-0">
      <div className="flex items-center space-x-4">
        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
          <Package className="w-5 h-5 text-gray-600" />
        </div>
        <div>
          <p className="font-medium text-gray-900">Đơn hàng #{id}</p>
          <p className="text-sm text-gray-600">{items} sản phẩm</p>
        </div>
      </div>
      <div className="text-right">
        <div
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            status === "pending"
              ? "bg-yellow-100 text-yellow-800"
              : status === "confirmed"
              ? "bg-blue-100 text-blue-800"
              : status === "packing"
              ? "bg-indigo-100 text-indigo-800"
              : status === "shipping"
              ? "bg-purple-100 text-purple-800"
              : status === "delivered"
              ? "bg-green-100 text-green-800"
              : status === "cancelled"
              ? "bg-red-100 text-red-800"
              : status === "returned"
              ? "bg-orange-100 text-orange-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {status === "pending"
            ? "Chờ xử lý"
            : status === "confirmed"
            ? "Đã xác nhận"
            : status === "packing"
            ? "Đang đóng gói"
            : status === "shipping"
            ? "Đang giao"
            : status === "delivered"
            ? "Đã giao"
            : status === "cancelled"
            ? "Đã hủy"
            : status === "returned"
            ? "Đã trả hàng"
            : status}
        </div>
        <p className="text-sm font-medium text-gray-900 mt-1">
          {formatPrice(total)}
        </p>
        <p className="text-xs text-gray-500">{date}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Xin chào, {user?.firstName}!
          </h1>
          <p className="text-gray-600 mt-1">
            Chào mừng bạn đến với tài khoản Memory Lane
          </p>
        </div>
        <div className="flex space-x-3">
          <Link
            to="/products"
            className="btn btn-primary flex items-center space-x-2"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Mua sắm ngay</span>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Tổng đơn hàng"
          value={isLoading ? "..." : stats.totalOrders}
          icon={ShoppingCart}
          color="blue"
          link="/customer/orders"
          description="Đơn hàng đã đặt"
        />
        <StatCard
          title="Đang xử lý"
          value={isLoading ? "..." : stats.pendingOrders}
          icon={Clock}
          color="yellow"
          link="/customer/orders?status=pending"
          description="Đơn hàng chờ xử lý"
        />
        <StatCard
          title="Tổng chi tiêu"
          value={isLoading ? "..." : formatPrice(stats.totalSpent)}
          icon={CreditCard}
          color="green"
          description="Tổng số tiền đã chi"
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
              title="Xem đơn hàng"
              description="Theo dõi trạng thái đơn hàng"
              icon={Package}
              link="/customer/orders"
              color="blue"
            />
            <QuickAction
              title="Cập nhật hồ sơ"
              description="Chỉnh sửa thông tin cá nhân"
              icon={User}
              link="/customer/profile"
              color="green"
            />
            <QuickAction
              title="Đánh giá sản phẩm"
              description="Viết đánh giá cho sản phẩm đã mua"
              icon={Star}
              link="/customer/reviews"
              color="yellow"
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
              to="/customer/orders"
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
                <RecentOrder
                  key={order.id}
                  id={order.orderNumber}
                  status={order.status}
                  total={order.totalAmount}
                  items={order.items?.length || 0}
                  date={new Date(order.createdAt).toLocaleDateString('vi-VN')}
                />
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                Bạn chưa có đơn hàng nào
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Welcome Message for New Users */}
      {stats.totalOrders === 0 && (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full mr-4">
              <ShoppingCart className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Chào mừng bạn đến với Memory Lane!
              </h3>
              <p className="text-gray-600 mt-1">
                Khám phá những món quà lưu niệm độc đáo mang đậm bản sắc văn hóa
                Việt Nam.
              </p>
            </div>
          </div>
          <div className="mt-4">
            <Link to="/products" className="btn btn-primary">
              Khám phá sản phẩm
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDashboard;
