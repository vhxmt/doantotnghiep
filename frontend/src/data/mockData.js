// Helper functions
export const formatPrice = (price) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
};

export const getDiscountPercentage = (price, comparePrice) => {
  if (!comparePrice || comparePrice <= price) return 0;
  return Math.round(((comparePrice - price) / comparePrice) * 100);
};

export const getStatusColor = (status) => {
  const colors = {
    pending: "warning",
    confirmed: "info",
    packing: "info",
    shipping: "primary",
    delivered: "success",
    cancelled: "error",
    returned: "error",
  };
  return colors[status] || "default";
};

export const getStatusText = (status) => {
  const texts = {
    pending: "Chờ xử lý",
    confirmed: "Đã xác nhận",
    packing: "Đang đóng gói",
    shipping: "Đang giao hàng",
    delivered: "Đã giao",
    cancelled: "Đã hủy",
    returned: "Đã trả hàng",
  };
  return texts[status] || status;
};
