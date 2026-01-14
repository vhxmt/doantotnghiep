import { useState, useEffect, useRef } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Edit,
  Save,
  X,
  Camera,
  Key,
  Heart,
  ShoppingBag,
  Star,
  Upload,
  Trash2,
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { uploadAPI } from "../../services/api";
import { formatPrice } from "../../data/mockData";
import toast from "react-hot-toast";
import ChangePasswordModal from "../../components/ChangePasswordModal";

const CustomerProfile = () => {
  const { user, updateProfile } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] =
    useState(false);
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    dateOfBirth: "",
    gender: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
        dateOfBirth: user.dateOfBirth || "",
        gender: user.gender || "",
      });
    }
  }, [user]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form data
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
        dateOfBirth: user.dateOfBirth || "",
        gender: user.gender || "",
      });
    }
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      await updateProfile(formData);
      toast.success("Cập nhật thông tin thành công");
      setIsEditing(false);
    } catch (error) {
      console.error("Update profile error:", error);
      toast.error(
        error.response?.data?.message || "Không thể cập nhật thông tin"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file ảnh');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Kích thước ảnh không được vượt quá 5MB');
      return;
    }

    try {
      setIsUploadingAvatar(true);
      
      // Upload avatar
      const response = await uploadAPI.uploadImage(file, 'users');
      console.log('Upload response:', response.data);
      const avatarUrl = response.data.data.url;
      console.log('Avatar URL:', avatarUrl);

      // Update profile with new avatar
      const result = await updateProfile({ avatar: avatarUrl });
      console.log('Update profile result:', result);
      
      if (result.success) {
        toast.success('Cập nhật ảnh đại diện thành công');
      }
    } catch (error) {
      console.error('Upload avatar error:', error);
      toast.error(error.response?.data?.message || 'Không thể tải ảnh lên');
    } finally {
      setIsUploadingAvatar(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeleteAvatar = async () => {
    if (!user.avatar) return;

    if (!window.confirm('Bạn có chắc muốn xóa ảnh đại diện?')) return;

    try {
      setIsUploadingAvatar(true);
      
      // Delete avatar from server
      if (user.avatar && !user.avatar.includes('default')) {
        try {
          await uploadAPI.deleteImage(user.avatar);
        } catch (error) {
          console.warn('Error deleting old avatar:', error);
        }
      }

      // Update profile without avatar
      await updateProfile({ avatar: null });
      
      toast.success('Đã xóa ảnh đại diện');
    } catch (error) {
      console.error('Delete avatar error:', error);
      toast.error(error.response?.data?.message || 'Không thể xóa ảnh');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Chưa cập nhật";
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getRoleBadge = (roles) => {
    if (!roles || roles.length === 0) return null;

    const role = roles[0];
    const roleConfig = {
      admin: { color: "purple", text: "Quản trị viên" },
      staff: { color: "blue", text: "Nhân viên" },
      customer: { color: "green", text: "Khách hàng" },
    };

    const config = roleConfig[role.name] || roleConfig.customer;

    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-${config.color}-100 text-${config.color}-800`}
      >
        <Shield className="w-4 h-4 mr-1" />
        {config.text}
      </span>
    );
  };

  if (!user) {
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
            Thông tin cá nhân
          </h1>
          <p className="text-gray-600 mt-1">
            Quản lý thông tin tài khoản và cài đặt cá nhân
          </p>
        </div>
        {!isEditing && (
          <button
            onClick={handleEdit}
            className="btn btn-primary flex items-center space-x-2"
          >
            <Edit className="w-4 h-4" />
            <span>Chỉnh sửa</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-center">
              <div className="relative inline-block">
                <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4 overflow-hidden">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={`${user.firstName} ${user.lastName}`}
                      className="w-24 h-24 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl font-bold text-gray-600">
                      {user.firstName?.charAt(0)}
                      {user.lastName?.charAt(0)}
                    </span>
                  )}
                  {isUploadingAvatar && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
                <div className="absolute bottom-4 right-0 flex space-x-1">
                  <button 
                    onClick={handleAvatarClick}
                    disabled={isUploadingAvatar}
                    className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Tải ảnh lên"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                  {user.avatar && (
                    <button 
                      onClick={handleDeleteAvatar}
                      disabled={isUploadingAvatar}
                      className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Xóa ảnh"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <h2 className="text-xl font-semibold text-gray-900">
                {user.firstName} {user.lastName}
              </h2>
              <p className="text-gray-600 mb-4">{user.email}</p>

              <div className="mb-4">{getRoleBadge(user.roles)}</div>

              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center justify-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>Tham gia: {formatDate(user.created_at)}</span>
                </div>
                {user.lastLogin && (
                  <div className="flex items-center justify-center">
                    <span>Đăng nhập cuối: {formatDate(user.lastLogin)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Customer Stats */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Thống kê mua sắm
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <ShoppingBag className="w-5 h-5 text-blue-600 mr-2" />
                  <span className="text-gray-600">Tổng đơn hàng</span>
                </div>
                <span className="font-semibold text-gray-900">1</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-gray-600">Tổng chi tiêu</span>
                </div>
                <span className="font-semibold text-gray-900">
                  {formatPrice(187000)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Heart className="w-5 h-5 text-red-600 mr-2" />
                  <span className="text-gray-600">Yêu thích</span>
                </div>
                <span className="font-semibold text-gray-900">0</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Star className="w-5 h-5 text-yellow-600 mr-2" />
                  <span className="text-gray-600">Đánh giá</span>
                </div>
                <span className="font-semibold text-gray-900">0</span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Information */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Thông tin chi tiết
              </h3>
              {isEditing && (
                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleCancel}
                    className="btn btn-outline btn-sm flex items-center space-x-2"
                  >
                    <X className="w-4 h-4" />
                    <span>Hủy</span>
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="btn btn-primary btn-sm flex items-center space-x-2"
                  >
                    {isLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    <span>Lưu</span>
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* First Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Họ
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="input"
                  />
                ) : (
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <User className="w-4 h-4 text-gray-400 mr-3" />
                    <span className="text-gray-900">
                      {user.firstName || "Chưa cập nhật"}
                    </span>
                  </div>
                )}
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="input"
                  />
                ) : (
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <User className="w-4 h-4 text-gray-400 mr-3" />
                    <span className="text-gray-900">
                      {user.lastName || "Chưa cập nhật"}
                    </span>
                  </div>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <Mail className="w-4 h-4 text-gray-400 mr-3" />
                  <span className="text-gray-900">{user.email}</span>
                  {user.emailVerified && (
                    <span className="ml-2 text-green-600 text-sm">
                      ✓ Đã xác thực
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Email không thể thay đổi
                </p>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số điện thoại
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="input"
                  />
                ) : (
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <Phone className="w-4 h-4 text-gray-400 mr-3" />
                    <span className="text-gray-900">
                      {user.phone || "Chưa cập nhật"}
                    </span>
                  </div>
                )}
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ngày sinh
                </label>
                {isEditing ? (
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className="input"
                  />
                ) : (
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <Calendar className="w-4 h-4 text-gray-400 mr-3" />
                    <span className="text-gray-900">
                      {formatDate(user.dateOfBirth)}
                    </span>
                  </div>
                )}
              </div>

              {/* Gender */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Giới tính
                </label>
                {isEditing ? (
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="input"
                  >
                    <option value="">Chọn giới tính</option>
                    <option value="male">Nam</option>
                    <option value="female">Nữ</option>
                    <option value="other">Khác</option>
                  </select>
                ) : (
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <User className="w-4 h-4 text-gray-400 mr-3" />
                    <span className="text-gray-900">
                      {user.gender === "male"
                        ? "Nam"
                        : user.gender === "female"
                        ? "Nữ"
                        : user.gender === "other"
                        ? "Khác"
                        : "Chưa cập nhật"}
                    </span>
                  </div>
                )}
              </div>

              {/* Address */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Địa chỉ
                </label>
                {isEditing ? (
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    rows={3}
                    className="input resize-none"
                  />
                ) : (
                  <div className="flex items-start p-3 bg-gray-50 rounded-lg">
                    <MapPin className="w-4 h-4 text-gray-400 mr-3 mt-0.5" />
                    <span className="text-gray-900">
                      {user.address || "Chưa cập nhật"}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Security Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Bảo mật tài khoản
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center">
                  <Key className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Mật khẩu</p>
                    <p className="text-sm text-gray-500">
                      Cập nhật lần cuối: {formatDate(user.updated_at)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsChangePasswordModalOpen(true)}
                  className="btn btn-outline btn-sm"
                >
                  Đổi mật khẩu
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isChangePasswordModalOpen}
        onClose={() => setIsChangePasswordModalOpen(false)}
      />
    </div>
  );
};

export default CustomerProfile;
