import { useEffect } from "react";
import { Link } from "react-router-dom";
import useProductStore from "../../store/productStore";
import { useCartStore } from "../../store/cartStore";
import { formatPrice, getDiscountPercentage } from "../../data/mockData";
import {
  Star,
  ShoppingCart,
  ArrowRight,
  Truck,
  Shield,
  Clock,
} from "lucide-react";
import { productsAPI } from "../../services/api";
import ApiTest from "../../components/debug/ApiTest";

const HomePage = () => {
  const {
    featuredProducts,
    categories,
    isLoading,
    fetchFeaturedProducts,
    fetchCategories,
  } = useProductStore();

  const { addItem } = useCartStore();

  useEffect(() => {
    console.log("HomePage: useEffect triggered");
    console.log("fetchFeaturedProducts:", fetchFeaturedProducts);
    console.log("fetchCategories:", fetchCategories);
    console.log("featuredProducts:", featuredProducts);
    console.log("categories:", categories);
    console.log("isLoading:", isLoading);

    // Test direct API call
    productsAPI
      .getFeaturedProducts()
      .then((response) => {
        console.log("Direct API call success:", response.data);
      })
      .catch((err) => {
        console.error("Direct API call failed:", err);
      });

    fetchFeaturedProducts().catch((err) => {
      console.error("Failed to fetch featured products:", err);
    });

    fetchCategories().catch((err) => {
      console.error("Failed to fetch categories:", err);
    });
  }, [fetchFeaturedProducts, fetchCategories]);

  return (
    <div className="min-h-screen">
      {/* Debug Component */}
      {/* <ApiTest /> */}

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Memory Lane</h1>
          <p className="text-xl md:text-2xl mb-8 text-blue-100">
            Nơi lưu giữ những kỷ niệm đẹp từ quê hương
          </p>
          <Link
            to="/products"
            className="inline-flex items-center px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors duration-200"
          >
            Khám phá ngay
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Tại sao chọn Memory Lane?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Chúng tôi cam kết mang đến cho bạn những món quà lưu niệm ý nghĩa
              và chân thực nhất
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Hàng thủ công chính gốc
              </h3>
              <p className="text-gray-600">
                Sản phẩm được tuyển chọn từ các nghệ nhân uy tín
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Giao hàng toàn cầu</h3>
              <p className="text-gray-600">
                Đóng gói cẩn thận, ship toàn thế giới
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Giá trị văn hóa</h3>
              <p className="text-gray-600">
                Mỗi sản phẩm đều chứa đựng câu chuyện riêng
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Sản phẩm nổi bật
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Những món quà lưu niệm được khách hàng yêu thích nhất
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl shadow-sm overflow-hidden animate-pulse"
                >
                  <div className="w-full h-48 bg-gray-200"></div>
                  <div className="p-4">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded mb-3"></div>
                    <div className="flex items-center justify-between">
                      <div className="h-6 bg-gray-200 rounded w-20"></div>
                      <div className="h-8 bg-gray-200 rounded w-16"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {(featuredProducts || []).map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
                >
                  <div className="relative">
                    <Link to={`/products/${product.slug}`}>
                      <img
                        src={
                          product.images?.[0]?.imageUrl ||
                          "https://via.placeholder.com/400x300"
                        }
                        alt={product.images?.[0]?.altText || product.name}
                        className="w-full h-48 object-cover"
                      />
                    </Link>
                    {product.comparePrice && (
                      <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-sm font-medium">
                        -
                        {getDiscountPercentage(
                          product.price,
                          product.comparePrice
                        )}
                        %
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <Link to={`/products/${product.slug}`}>
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-blue-600 transition-colors duration-200">
                        {product.name}
                      </h3>
                    </Link>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {product.shortDescription}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-bold text-gray-900">
                          {formatPrice(product.price)}
                        </span>
                        {product.comparePrice && (
                          <span className="text-sm text-gray-500 line-through">
                            {formatPrice(product.comparePrice)}
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => addItem(product.id, 1)}
                        disabled={product.status !== "active"}
                        className="flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ShoppingCart className="w-4 h-4 mr-1" />
                        <span className="text-sm">Thêm</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-8">
            <Link
              to="/products"
              className="inline-flex items-center px-6 py-3 border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg transition-colors duration-200"
            >
              Xem tất cả sản phẩm
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Danh mục sản phẩm
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Khám phá các danh mục sản phẩm đa dạng của chúng tôi
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {(categories || []).slice(0, 8).map((category) => (
              <Link
                key={category.id}
                to={`/products?category=${encodeURIComponent(category.name)}`}
                className="group text-center hover:transform hover:scale-105 transition-all duration-200"
              >
                <div className="w-20 h-20 mx-auto mb-4 rounded-full overflow-hidden bg-gray-100 group-hover:shadow-lg transition-shadow duration-200">
                  <img
                    src={category.image || "https://via.placeholder.com/80x80"}
                    alt={category.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
                  {category.name}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Bắt đầu mua sắm ngay hôm nay
          </h2>
          <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
            Đăng ký tài khoản để nhận được những ưu đãi đặc biệt và trải nghiệm
            mua sắm tuyệt vời
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/auth/register"
              className="inline-flex items-center px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors duration-200"
            >
              Đăng ký ngay
            </Link>
            <Link
              to="/products"
              className="inline-flex items-center px-8 py-4 border-2 border-white text-white hover:bg-white hover:text-blue-600 font-semibold rounded-lg transition-colors duration-200"
            >
              Xem sản phẩm
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
