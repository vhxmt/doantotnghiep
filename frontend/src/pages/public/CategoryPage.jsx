import { useEffect } from "react";
import { Link } from "react-router-dom";
import useProductStore from "../../store/productStore";
import { ArrowRight, Package } from "lucide-react";

const CategoryPage = () => {
  const { categories, isLoading, fetchCategories } = useProductStore();

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Get product count for each category
  const getCategoryProductCount = (category) => {
    return category.productCount || 0;
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Danh mục sản phẩm
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto">
            Khám phá bộ sưu tập đồ lưu niệm thủ công phong phú mang đậm bản sắc
            văn hóa
          </p>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl shadow-sm overflow-hidden animate-pulse"
                >
                  <div className="w-full h-48 bg-gray-200"></div>
                  <div className="p-6">
                    <div className="h-6 bg-gray-200 rounded mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {(categories || []).map((category) => (
                <div key={category.id} className="group">
                  <Link
                    to={`/products?categoryId=${category.id}`}
                    className="block bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group-hover:transform group-hover:scale-105"
                  >
                    {/* Category Image */}
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={
                          category.image ||
                          "https://via.placeholder.com/400x300"
                        }
                        alt={category.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-30 transition-all duration-300"></div>

                      {/* Product Count Badge */}
                      <div className="absolute top-4 right-4 bg-white bg-opacity-90 backdrop-blur-sm px-3 py-1 rounded-full">
                        <div className="flex items-center space-x-1">
                          <Package className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-medium text-gray-900">
                            {getCategoryProductCount(category)} sản phẩm
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Category Info */}
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-200">
                        {category.name}
                      </h3>

                      {/* Description */}
                      {category.description && (
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                          {category.description}
                        </p>
                      )}

                      {/* View Products Button */}
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 text-sm">
                          Khám phá ngay
                        </span>
                        <ArrowRight className="w-5 h-5 text-blue-600 group-hover:translate-x-1 transition-transform duration-200" />
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Popular Categories */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Danh mục phổ biến
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Những danh mục được khách hàng yêu thích và mua sắm nhiều nhất
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {(categories || []).slice(0, 4).map((category) => (
              <Link
                key={category.id}
                to={`/products?category=${encodeURIComponent(category.name)}`}
                className="group text-center hover:transform hover:scale-105 transition-all duration-200"
              >
                <div className="w-20 h-20 mx-auto mb-4 rounded-full overflow-hidden bg-white shadow-sm group-hover:shadow-md transition-shadow duration-200">
                  <img
                    src={category.image || "https://via.placeholder.com/80x80"}
                    alt={category.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
                  {category.name}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {getCategoryProductCount(category.name)} sản phẩm
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Không tìm thấy danh mục bạn cần?
          </h2>
          <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
            Hãy liên hệ với chúng tôi để đề xuất danh mục sản phẩm mới. Chúng
            tôi luôn lắng nghe và cập nhật theo nhu cầu của khách hàng.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/contact"
              className="inline-flex items-center px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors duration-200"
            >
              Liên hệ đề xuất
            </Link>
            <Link
              to="/products"
              className="inline-flex items-center px-8 py-4 border-2 border-white text-white hover:bg-white hover:text-blue-600 font-semibold rounded-lg transition-colors duration-200"
            >
              Xem tất cả sản phẩm
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CategoryPage;
