import { useState, useEffect } from "react";
import {
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  BarChart3,
  PieChart,
  Activity,
  Filter,
} from "lucide-react";
import { statsAPI } from "../../services/api";
import { formatPrice } from "../../data/mockData";
import toast from "react-hot-toast";

const AdminReports = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState("7days");
  const [dashboardStats, setDashboardStats] = useState({});
  const [salesData, setSalesData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);

  useEffect(() => {
    fetchReportsData();
  }, [dateRange]);

  const fetchReportsData = async () => {
    try {
      setIsLoading(true);

      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      
      switch(dateRange) {
        case '7days':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case '30days':
          startDate.setDate(endDate.getDate() - 30);
          break;
        case '3months':
          startDate.setMonth(endDate.getMonth() - 3);
          break;
        case '6months':
          startDate.setMonth(endDate.getMonth() - 6);
          break;
        case '1year':
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
        default:
          startDate.setDate(endDate.getDate() - 7);
      }

      // Fetch real data from API
      const [dashboardResponse, topProductsResponse, salesResponse] = await Promise.all([
        statsAPI.getDashboardStats(),
        statsAPI.getTopProducts({ limit: 10 }),
        statsAPI.getSalesStats({ 
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0]
        }),
      ]);

      const dashboardData = dashboardResponse.data.data;
      const topProductsData = topProductsResponse.data.data;
      const salesStatsData = salesResponse.data.data;

      // Transform dashboard stats
      setDashboardStats({
        totalRevenue: dashboardData.totalRevenue || 0,
        totalOrders: dashboardData.totalOrders || 0,
        totalCustomers: dashboardData.totalUsers || 0,
        totalProducts: dashboardData.totalProducts || 0,
      });

      // Transform top products
      setTopProducts(
        topProductsData.topProducts?.map((item) => ({
          id: item.product?.id || item.productId,
          name: item.product?.name || "N/A",
          sales: parseInt(item.totalSold) || 0,
          revenue: parseFloat(item.totalRevenue) || 0,
          growth: 0,
        })) || []
      );

      // Transform sales data - Sắp xếp theo ngày tăng dần
      const salesArray = salesStatsData.sales?.map((item) => ({
        date: item.date,
        revenue: parseFloat(item.revenue) || 0,
        orders: parseInt(item.orderCount) || 0,
      })) || [];

      // Sort by date ascending (oldest first)
      salesArray.sort((a, b) => new Date(a.date) - new Date(b.date));

      setSalesData(salesArray);
    } catch (error) {
      console.error("Failed to fetch reports data:", error);
      toast.error("Không thể tải dữ liệu báo cáo");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      month: "short",
      day: "numeric",
    });
  };

  const StatCard = ({ title, value, icon: Icon, color = "blue" }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <div className={`p-3 rounded-full bg-${color}-100`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
      </div>
    </div>
  );

  const SalesChart = () => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Doanh thu theo ngày
        </h3>
        <div className="flex items-center space-x-2">
          <BarChart3 className="w-5 h-5 text-gray-400" />
          <span className="text-sm text-gray-500">
            {dateRange === '7days' && '7 ngày qua'}
            {dateRange === '30days' && '30 ngày qua'}
            {dateRange === '3months' && '3 tháng qua'}
            {dateRange === '6months' && '6 tháng qua'}
            {dateRange === '1year' && '1 năm qua'}
          </span>
        </div>
      </div>

      {salesData.length > 0 ? (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {salesData.slice().reverse().map((day, index) => {
            const maxRevenue = Math.max(...salesData.map((d) => d.revenue));
            const percentage = maxRevenue > 0 ? (day.revenue / maxRevenue) * 100 : 0;

            return (
              <div key={`${day.date}-${index}`} className="flex items-center space-x-4">
                <div className="w-20 text-sm text-gray-600 flex-shrink-0">
                  {new Date(day.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900">
                      {formatPrice(day.revenue)}
                    </span>
                    <span className="text-sm text-gray-500">
                      {day.orders} đơn
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8">
          <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Chưa có dữ liệu doanh thu trong khoảng thời gian này</p>
        </div>
      )}
    </div>
  );

  const TopProductsTable = () => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Sản phẩm bán chạy
        </h3>
        <PieChart className="w-5 h-5 text-gray-400" />
      </div>

      {topProducts.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider pb-3">
                  Sản phẩm
                </th>
                <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider pb-3">
                  Đã bán
                </th>
                <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider pb-3">
                  Doanh thu
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {topProducts.map((product, index) => (
                <tr key={product.id}>
                  <td className="py-3">
                    <div className="flex items-center">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-xs font-medium text-blue-600">
                          {index + 1}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {product.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 text-right text-sm text-gray-900">
                    {product.sales}
                  </td>
                  <td className="py-3 text-right text-sm font-medium text-gray-900">
                    {formatPrice(product.revenue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Chưa có dữ liệu sản phẩm bán chạy</p>
        </div>
      )}
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Báo cáo & Thống kê
          </h1>
          <p className="text-gray-600 mt-1">
            Phân tích doanh thu và hiệu suất kinh doanh
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-4">
          <Filter className="w-5 h-5 text-gray-400" />
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Khoảng thời gian
            </label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="input w-full md:w-64"
            >
              <option value="7days">7 ngày qua</option>
              <option value="30days">30 ngày qua</option>
              <option value="3months">3 tháng qua</option>
              <option value="6months">6 tháng qua</option>
              <option value="1year">1 năm qua</option>
            </select>
          </div>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Tổng doanh thu"
          value={formatPrice(dashboardStats.totalRevenue)}
          icon={DollarSign}
          color="green"
        />
        <StatCard
          title="Tổng đơn hàng"
          value={dashboardStats.totalOrders?.toLocaleString()}
          icon={ShoppingCart}
          color="blue"
        />
        <StatCard
          title="Khách hàng"
          value={dashboardStats.totalCustomers?.toLocaleString()}
          icon={Users}
          color="purple"
        />
        <StatCard
          title="Sản phẩm"
          value={dashboardStats.totalProducts?.toLocaleString()}
          icon={Package}
          color="indigo"
        />
      </div>

      {/* Charts and Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SalesChart />
        <TopProductsTable />
      </div>
    </div>
  );
};

export default AdminReports;
