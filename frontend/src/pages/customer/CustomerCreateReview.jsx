import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Star, ArrowLeft } from "lucide-react";
import api, { reviewAPI } from "../../services/api";
import toast from "react-hot-toast";

const CustomerCreateReview = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const productId = searchParams.get("product");
  const orderId = searchParams.get("order");

  const [order, setOrder] = useState(null);
  const [product, setProduct] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    rating: 0,
    title: "",
    comment: "",
  });

  useEffect(() => {
    if (productId) {
      fetchProduct();
    } else if (orderId) {
      fetchOrder();
    }
  }, [productId, orderId]);

  const fetchOrder = async () => {
    try {
      setIsLoading(true);
      console.log("🔍 Fetching order with ID:", orderId);

      const response = await api.get(`/orders/${orderId}`);
      console.log("✅ Order response:", response.data);

      if (response.data.status === "success") {
        setOrder(response.data.data.order);
        // If there's only one product, auto-select it
        if (response.data.data.order.items?.length === 1) {
          const item = response.data.data.order.items[0];
          setProduct(item.product);
          setSelectedProduct(item.productId);
        }
      }
    } catch (error) {
      console.error("❌ Failed to fetch order:", error);
      console.error("❌ Error response:", error.response?.data);
      toast.error("Không thể tải thông tin đơn hàng");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProduct = async () => {
    try {
      setIsLoading(true);
      console.log("🔍 Fetching product with ID:", productId);

      const response = await api.get(`/products/${productId}`);
      console.log("✅ Product response:", response.data);

      if (response.data.status === "success") {
        setProduct(response.data.data.product);
        setSelectedProduct(productId);
      }
    } catch (error) {
      console.error("❌ Failed to fetch product:", error);
      console.error("❌ Error response:", error.response?.data);
      toast.error("Không thể tải thông tin sản phẩm");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectProduct = (item) => {
    setProduct(item.product);
    setSelectedProduct(item.productId);
  };

  const handleRatingClick = (rating) => {
    setFormData((prev) => ({ ...prev, rating }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.rating === 0) {
      toast.error("Vui lòng chọn số sao đánh giá");
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await reviewAPI.createReview({
        productId: parseInt(selectedProduct || productId),
        orderId: orderId ? parseInt(orderId) : undefined,
        rating: formData.rating,
        title: formData.title,
        comment: formData.comment,
      });

      if (response.data.status === "success") {
        toast.success(
          "Gửi đánh giá thành công! Đánh giá của bạn đang chờ duyệt."
        );
        navigate("/customer/reviews");
      }
    } catch (error) {
      console.error("Failed to submit review:", error);
      toast.error(error.response?.data?.message || "Không thể gửi đánh giá");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  // If order has multiple products and none selected yet, show product selection
  if (order && order.items?.length > 1 && !selectedProduct) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            Chọn sản phẩm để đánh giá
          </h1>
          <p className="text-gray-600 mt-1">Đơn hàng #{order.orderNumber}</p>
        </div>

        <div className="space-y-4">
          {order.items.map((item) => (
            <button
              key={item.id}
              onClick={() => handleSelectProduct(item)}
              className="w-full bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:border-blue-500 hover:shadow-md transition-all text-left"
            >
              <div className="flex items-start space-x-4">
                <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={
                      item.product?.images?.[0]?.imageUrl ||
                      "/placeholder-product.jpg"
                    }
                    alt={item.product?.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 mb-1">
                    {item.product?.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    Số lượng: {item.quantity}
                  </p>
                  <p className="text-lg font-bold text-blue-600">
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(item.unitPrice)}
                  </p>
                </div>
                <div className="text-blue-600">
                  <Star className="w-6 h-6" />
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Không tìm thấy sản phẩm</p>
          <Link to="/customer/orders" className="text-blue-600 hover:underline">
            Quay lại đơn hàng
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Viết đánh giá</h1>
        <p className="text-gray-600 mt-1">
          Chia sẻ trải nghiệm của bạn về sản phẩm này
        </p>
      </div>

      {/* Product Info */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center space-x-4">
          <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
            <img
              src={product.images?.[0]?.imageUrl || "/placeholder-product.jpg"}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{product.name}</h3>
            <p className="text-sm text-gray-600">{product.shortDescription}</p>
          </div>
        </div>
      </div>

      {/* Review Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
      >
        {/* Rating */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Đánh giá của bạn <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => handleRatingClick(star)}
                onMouseEnter={() =>
                  setFormData((prev) => ({ ...prev, hoverRating: star }))
                }
                onMouseLeave={() =>
                  setFormData((prev) => ({ ...prev, hoverRating: 0 }))
                }
                className="focus:outline-none transition-transform hover:scale-110"
              >
                <Star
                  className={`w-8 h-8 ${
                    star <= (formData.hoverRating || formData.rating)
                      ? "text-yellow-400 fill-current"
                      : "text-gray-300"
                  }`}
                />
              </button>
            ))}
            {formData.rating > 0 && (
              <span className="ml-2 text-gray-600">
                {formData.rating}/5 sao
              </span>
            )}
          </div>
        </div>

        {/* Title */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Tiêu đề (Tùy chọn)
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, title: e.target.value }))
            }
            placeholder="Tóm tắt đánh giá của bạn"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            maxLength={100}
          />
        </div>

        {/* Comment */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Nhận xét (Tùy chọn)
          </label>
          <textarea
            value={formData.comment}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, comment: e.target.value }))
            }
            placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={5}
          />
        </div>

        {/* Images */}

        {/* Submit Buttons */}
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={isSubmitting || formData.rating === 0}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Đang gửi..." : "Gửi đánh giá"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CustomerCreateReview;
