import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useProductStore from "../../store/productStore";
import { uploadAPI } from "../../services/api";
import toast from "react-hot-toast";
import { Plus, Trash2, Upload, X, Loader2 } from "lucide-react";
import { Input, message } from "antd";

const { TextArea } = Input;

const AdminProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const {
    currentProduct,
    categories,
    isLoading,
    fetchProductById,
    createProduct,
    updateProduct,
    fetchCategories,
    clearCurrentProduct,
  } = useProductStore();

  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    description: "",
    price: "",
    comparePrice: "",
    status: "active",
    inventory: { quantity: 0 },
    categoryIds: [],
    images: [], 
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchCategories();
    if (isEditMode) {
      fetchProductById(id);
    }
    return () => {
      clearCurrentProduct();
    };
  }, [id, isEditMode, fetchProductById, fetchCategories, clearCurrentProduct]);

  useEffect(() => {
    if (isEditMode && currentProduct) {
      setFormData({
        name: currentProduct.name || "",
        sku: currentProduct.sku || "",
        description: currentProduct.description || "",
        price: currentProduct.price || "",
        comparePrice: currentProduct.comparePrice || "",
        status: currentProduct.status || "active",
        inventory: { quantity: currentProduct.inventory?.quantity || 0 },
        categoryIds: currentProduct.categories?.map((cat) => cat.id) || [],
        images:
          currentProduct.images?.map((img) => ({
            id: img.id,
            url: img.imageUrl,
          })) || [],
      });
    }
  }, [currentProduct, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "quantity") {
      setFormData((prev) => ({
        ...prev,
        inventory: { ...prev.inventory, quantity: parseInt(value, 10) || 0 },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleCategoryChange = (categoryId) => {
    setFormData((prev) => {
      const newCategoryIds = prev.categoryIds.includes(categoryId)
        ? prev.categoryIds.filter((id) => id !== categoryId)
        : [...prev.categoryIds, categoryId];
      return { ...prev, categoryIds: newCategoryIds };
    });
  };

  const handleImageChange = (e) => {
    if (e.target.files) {
      setImageFiles(Array.from(e.target.files));
    }
  };

  const handleImageUpload = async () => {
    if (imageFiles.length === 0) return;
    setIsUploading(true);
    try {
      const uploadPromises = imageFiles.map((file) =>
        uploadAPI.uploadImage(file, "product")
      );
      const responses = await Promise.all(uploadPromises);
      const newImages = responses.map((res) => ({
        id: res.data.data.id,
        url: res.data.data.url,
      }));
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...newImages],
      }));
      setImageFiles([]);
      message.success("Tải ảnh lên thành công!");
      toast.success("Tải ảnh lên thành công!");
    } catch (error) {
      message.error(
        "Tải ảnh lên thất bại: " +
          (error.response?.data?.message || error.message)
      );
      toast.error("Tải ảnh lên thất bại.");
      console.error("Upload error:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let uploadedImages = [];

    // Auto-upload images if there are files selected but not uploaded yet
    if (imageFiles.length > 0) {
      message.warning("Đang tải ảnh lên, vui lòng đợi...");
      setIsUploading(true);
      try {
        const uploadPromises = imageFiles.map((file) =>
          uploadAPI.uploadImage(file, "product")
        );
        const responses = await Promise.all(uploadPromises);
        uploadedImages = responses.map((res) => ({
          id: res.data.data.id,
          url: res.data.data.url,
        }));

        console.log(" Uploaded images:", uploadedImages);

        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, ...uploadedImages],
        }));
        setImageFiles([]);
        message.success("Tải ảnh lên thành công!");
        setIsUploading(false);
      } catch (error) {
        message.error(
          "Tải ảnh lên thất bại: " +
            (error.response?.data?.message || error.message)
        );
        setIsUploading(false);
        return; // Stop submission if upload fails
      }
    }

    // Combine existing images with newly uploaded ones
    const allImages = [...formData.images, ...uploadedImages];

    console.log(" All images for submission:", allImages);

    const submissionData = {
      ...formData,
      price: parseFloat(formData.price),
      comparePrice: formData.comparePrice
        ? parseFloat(formData.comparePrice)
        : null,
      imageIds: allImages.filter((img) => img.id).map((img) => img.id),
    };

    console.log(" Submission data:", submissionData);
    console.log(" Image IDs:", submissionData.imageIds);

    // Validate that we have at least some data
    if (submissionData.imageIds.length === 0) {
      message.warning("Vui lòng thêm ít nhất một ảnh sản phẩm");
      return;
    }

    // Clean up data that shouldn't be sent
    delete submissionData.images;

    try {
      if (isEditMode) {
        console.log(" Updating product with data:", submissionData);
        const result = await updateProduct(id, submissionData);
        console.log(" Update result:", result);
        toast.success("Cập nhật sản phẩm thành công!");
        // Small delay to ensure state is updated
        setTimeout(() => {
          navigate("/admin/products");
        }, 500);
      } else {
        console.log(" Creating product with data:", submissionData);
        const result = await createProduct(submissionData);
        console.log(" Create result:", result);
        toast.success("Thêm sản phẩm thành công!");
        navigate("/admin/products");
      }
    } catch (error) {
      // Error toast is handled in the store
      console.error(" Failed to save product", error);
      console.error("Error response:", error.response?.data);
      toast.error(
        "Lưu sản phẩm thất bại: " +
          (error.response?.data?.message || error.message)
      );
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-7xl mx-auto space-y-8 px-4 sm:px-6 lg:px-8 pb-16"
    >
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditMode ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
        </h1>
        <div className="flex items-center space-x-4">
          <button
            type="button"
            onClick={() => navigate("/admin/products")}
            className="btn btn-secondary"
          >
            Hủy
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading || isUploading}
          >
            {isLoading ? <Loader2 className="animate-spin mr-2" /> : null}
            {isEditMode ? "Lưu thay đổi" : "Lưu sản phẩm"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="card bg-white shadow-sm border border-gray-200">
            <div className="card-body p-6 space-y-4">
              <h2 className="card-title text-lg font-semibold mb-4">
                Thông tin cơ bản
              </h2>
              <div className="form-control">
                <label className="label font-medium">Tên sản phẩm</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="input input-bordered"
                  required
                />
              </div>
              <div className="form-control">
                <label className="label font-medium">Mô tả</label>
                <TextArea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Nhập mô tả chi tiết về sản phẩm..."
                  autoSize={{ minRows: 4, maxRows: 8 }}
                  showCount
                  maxLength={1000}
                  style={{
                    fontSize: "14px",
                    borderRadius: "8px",
                    padding: "12px",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="card bg-white shadow-sm border border-gray-200">
            <div className="card-body p-6 space-y-4">
              <h2 className="card-title text-lg font-semibold mb-4">
                Hình ảnh
              </h2>
              <div className="mt-2">
                <div
                  className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50/30 transition h-44 flex flex-col items-center justify-center"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (e.dataTransfer.files) {
                      setImageFiles(Array.from(e.dataTransfer.files));
                    }
                  }}
                  onClick={() =>
                    document.getElementById("file-upload-input")?.click()
                  }
                >
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-600">
                    Kéo và thả ảnh vào đây, hoặc{" "}
                    <span className="font-medium text-blue-600">
                      nhấn để chọn tệp
                    </span>
                  </p>
                  <input
                    id="file-upload-input"
                    type="file"
                    multiple
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </div>
                {imageFiles.length > 0 && (
                  <div className="mt-4">
                    <p className="font-medium text-sm mb-2">Ảnh đã chọn:</p>
                    <ul className="list-disc list-inside text-sm text-gray-600">
                      {imageFiles.map((file, i) => (
                        <li key={i}>{file.name}</li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      onClick={handleImageUpload}
                      className="btn btn-secondary btn-sm mt-2"
                      disabled={isUploading}
                    >
                      {isUploading ? (
                        <Loader2 className="animate-spin mr-2" />
                      ) : (
                        <Upload className="w-4 h-4 mr-2" />
                      )}
                      Tải lên {imageFiles.length} ảnh
                    </button>
                  </div>
                )}
              </div>
              {formData.images.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-md font-medium text-gray-800 mb-2">
                    Ảnh hiện tại
                  </h3>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-5">
                    {formData.images.map((image, index) => (
                      <div key={index} className="relative group aspect-square">
                        <img
                          src={image.url}
                          alt={`Product image ${index + 1}`}
                          className="w-full h-full object-cover rounded-lg shadow"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Pricing & Inventory */}
          <div className="card bg-white shadow-sm border border-gray-200">
            <div className="card-body p-6 space-y-4">
              <h2 className="card-title text-lg font-semibold mb-4">
                Giá & Tồn kho
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="form-control">
                  <label className="label font-medium">Giá bán</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    className="input input-bordered"
                    required
                    min="0"
                  />
                </div>
                <div className="form-control">
                  <label className="label font-medium">
                    Giá so sánh (tùy chọn)
                  </label>
                  <input
                    type="number"
                    name="comparePrice"
                    value={formData.comparePrice}
                    onChange={handleChange}
                    className="input input-bordered"
                    min="0"
                  />
                </div>
                <div className="form-control">
                  <label className="label font-medium">SKU (Mã sản phẩm)</label>
                  <input
                    type="text"
                    name="sku"
                    value={formData.sku}
                    onChange={handleChange}
                    className="input input-bordered"
                    required
                  />
                </div>
                <div className="form-control">
                  <label className="label font-medium">Số lượng tồn kho</label>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.inventory.quantity}
                    onChange={handleChange}
                    className="input input-bordered"
                    min="0"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6 lg:sticky lg:top-24">
          {/* Status */}
          <div className="card bg-white shadow-sm border border-gray-200">
            <div className="card-body p-6 space-y-4">
              <h2 className="card-title text-lg font-semibold mb-2">
                Trạng thái
              </h2>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="select select-bordered w-full"
              >
                <option value="active">Hoạt động</option>
                <option value="out_of_stock">Hết hàng</option>
                <option value="discontinued">Ngừng bán</option>
              </select>
            </div>
          </div>

          {/* Categories */}
          <div className="card bg-white shadow-sm border border-gray-200">
            <div className="card-body p-6 space-y-4">
              <h2 className="card-title text-lg font-semibold mb-2">
                Danh mục
              </h2>
              <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
                {categories.map((cat) => (
                  <div key={cat.id} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`category-${cat.id}`}
                      checked={formData.categoryIds.includes(cat.id)}
                      onChange={() => handleCategoryChange(cat.id)}
                      className="checkbox checkbox-primary"
                    />
                    <label
                      htmlFor={`category-${cat.id}`}
                      className="ml-3 text-sm font-medium"
                    >
                      {cat.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};

export default AdminProductForm;
