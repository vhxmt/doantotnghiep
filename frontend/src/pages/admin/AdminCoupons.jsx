import { useState, useEffect } from 'react'
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Copy,
  Tag,
  Calendar,
  Percent,
  DollarSign,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Gift
} from 'lucide-react'
import { couponsAPI } from '../../services/api'
import { formatPrice } from '../../data/mockData'
import toast from 'react-hot-toast'

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState(null)
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    type: 'percentage',
    value: '',
    minOrderAmount: '',
    maxDiscountAmount: '',
    usageLimit: '',
    usageCount: 0,
    startDate: '',
    endDate: '',
    status: 'active'
  })

  useEffect(() => {
    fetchCoupons()
  }, [])

  const fetchCoupons = async () => {
    try {
      setIsLoading(true)
      const response = await couponsAPI.getCoupons({
        search: searchQuery,
        status: statusFilter,
        type: typeFilter,
        sortBy: 'created_at',
        sortOrder: 'desc'
      })
      setCoupons(response.data.data.coupons)
    } catch (error) {
      console.error('Failed to fetch coupons:', error)
      toast.error('Không thể tải danh sách mã giảm giá')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateCoupon = async (e) => {
    e.preventDefault()
    try {
      await couponsAPI.createCoupon({
        ...formData,
        value: parseFloat(formData.value),
        minimumOrderAmount: formData.minOrderAmount ? parseFloat(formData.minOrderAmount) : null,
        maximumDiscountAmount: formData.maxDiscountAmount ? parseFloat(formData.maxDiscountAmount) : null,
        usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null,
      })
      toast.success('Tạo mã giảm giá thành công')
      setShowCreateModal(false)
      resetForm()
      fetchCoupons()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể tạo mã giảm giá')
    }
  }

  const handleUpdateCoupon = async (e) => {
    e.preventDefault()
    try {
      await couponsAPI.updateCoupon(editingCoupon.id, {
        ...formData,
        value: parseFloat(formData.value),
        minimumOrderAmount: formData.minOrderAmount ? parseFloat(formData.minOrderAmount) : null,
        maximumDiscountAmount: formData.maxDiscountAmount ? parseFloat(formData.maxDiscountAmount) : null,
        usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null,
      })
      toast.success('Cập nhật mã giảm giá thành công')
      setEditingCoupon(null)
      resetForm()
      fetchCoupons()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể cập nhật mã giảm giá')
    }
  }

  const handleDeleteCoupon = async (couponId) => {
    if (!confirm('Bạn có chắc chắn muốn xóa mã giảm giá này?')) return

    try {
      await couponsAPI.deleteCoupon(couponId)
      toast.success('Xóa mã giảm giá thành công')
      fetchCoupons()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể xóa mã giảm giá')
    }
  }

  const handleStatusChange = async (couponId, newStatus) => {
    try {
      await couponsAPI.updateCouponStatus(couponId, newStatus)
      toast.success('Cập nhật trạng thái thành công')
      fetchCoupons()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể cập nhật trạng thái')
    }
  }

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code)
    toast.success('Đã sao chép mã giảm giá')
  }

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      description: '',
      type: 'percentage',
      value: '',
      minOrderAmount: '',
      maxDiscountAmount: '',
      usageLimit: '',
      usageCount: 0,
      startDate: '',
      endDate: '',
      status: 'active'
    })
  }

  const openEditModal = (coupon) => {
    setEditingCoupon(coupon)
    setFormData({
      code: coupon.code,
      name: coupon.name,
      description: coupon.description,
      type: coupon.type,
      value: coupon.value.toString(),
      minOrderAmount: coupon.minimumOrderAmount?.toString() || '',
      maxDiscountAmount: coupon.maxDiscountAmount?.toString() || '',
      usageLimit: coupon.usageLimit?.toString() || '',
      usageCount: coupon.usedCount,
      startDate: coupon.startsAt,
      endDate: coupon.expiresAt,
      status: coupon.status
    })
  }

  const generateCouponCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let result = ''
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setFormData({...formData, code: result})
  }

  const filteredCoupons = coupons.filter(coupon => {
    const matchesSearch = coupon.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         coupon.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = !statusFilter || coupon.status === statusFilter
    const matchesType = !typeFilter || coupon.type === typeFilter

    return matchesSearch && matchesStatus && matchesType
  })

  const getStatusBadge = (status, endDate) => {
    // Check if expired
    if (new Date(endDate) < new Date()) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <Clock className="w-3 h-3 mr-1" />
          Hết hạn
        </span>
      )
    }

    const statusConfig = {
      active: { color: 'green', text: 'Hoạt động', icon: CheckCircle },
      inactive: { color: 'gray', text: 'Tạm dừng', icon: XCircle },
      expired: { color: 'red', text: 'Hết hạn', icon: Clock }
    }

    const config = statusConfig[status] || statusConfig.active
    const Icon = config.icon

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${config.color}-100 text-${config.color}-800`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.text}
      </span>
    )
  }

  const getTypeBadge = (type) => {
    const typeConfig = {
      percentage: { color: 'blue', text: 'Phần trăm', icon: Percent },
      fixed: { color: 'green', text: 'Số tiền', icon: DollarSign },
      free_shipping: { color: 'purple', text: 'Miễn ship', icon: Gift }
    }

    const config = typeConfig[type] || typeConfig.percentage
    const Icon = config.icon

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${config.color}-100 text-${config.color}-800`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.text}
      </span>
    )
  }

  const formatDiscountValue = (type, value) => {
    switch (type) {
      case 'percentage':
        return `${value}%`
      case 'fixed':
        return formatPrice(value)
      case 'free_shipping':
        return 'Miễn phí ship'
      default:
        return value
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN')
  }

  const CouponRow = ({ coupon }) => {
    const usagePercentage = coupon.usageLimit ? (coupon.usedCount / coupon.usageLimit) * 100 : 0
    const isExpired = new Date(coupon.expiresAt) < new Date()
    const isUsedUp = coupon.usageLimit && coupon.usedCount >= coupon.usageLimit

    return (
      <tr className="hover:bg-gray-50">
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center">
            <div className="flex-shrink-0 h-10 w-10">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                <Tag className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <div className="flex items-center space-x-2">
                <div className="text-sm font-medium text-gray-900 font-mono">
                  {coupon.code}
                </div>
                <button
                  onClick={() => handleCopyCode(coupon.code)}
                  className="text-gray-400 hover:text-gray-600"
                  title="Sao chép mã"
                >
                  <Copy className="w-3 h-3" />
                </button>
              </div>
              <div className="text-sm text-gray-500">{coupon.name}</div>
            </div>
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center space-x-2">
            {getTypeBadge(coupon.type)}
            <span className="text-sm font-medium text-gray-900">
              {formatDiscountValue(coupon.type, coupon.value)}
            </span>
          </div>
          {coupon.minimumOrderAmount && (
            <div className="text-xs text-gray-500">
              Đơn tối thiểu: {formatPrice(coupon.minimumOrderAmount)}
            </div>
          )}
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm text-gray-900">
            {coupon.usedCount} / {coupon.usageLimit || '∞'}
          </div>
          {coupon.usageLimit && (
            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
              <div
                className={`h-1.5 rounded-full ${
                  usagePercentage >= 100 ? 'bg-red-500' :
                  usagePercentage >= 80 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(usagePercentage, 100)}%` }}
              ></div>
            </div>
          )}
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm text-gray-900 flex items-center">
            <Calendar className="w-3 h-3 mr-1" />
            {formatDate(coupon.startsAt)}
          </div>
          <div className="text-sm text-gray-500">
            đến {formatDate(coupon.expiresAt)}
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          {getStatusBadge(coupon.status, coupon.expiresAt)}
          {isUsedUp && (
            <div className="mt-1">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                Đã hết lượt
              </span>
            </div>
          )}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => openEditModal(coupon)}
              className="text-indigo-600 hover:text-indigo-900"
              title="Chỉnh sửa"
            >
              <Edit className="w-4 h-4" />
            </button>
            {!isExpired && !isUsedUp && (
              <button
                onClick={() => handleStatusChange(
                  coupon.id,
                  coupon.status === 'active' ? 'inactive' : 'active'
                )}
                className={`${
                  coupon.status === 'active' ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'
                }`}
                title={coupon.status === 'active' ? 'Tạm dừng' : 'Kích hoạt'}
              >
                {coupon.status === 'active' ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
              </button>
            )}
            <button
              onClick={() => handleDeleteCoupon(coupon.id)}
              className="text-red-600 hover:text-red-900"
              title="Xóa"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </td>
      </tr>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý mã giảm giá</h1>
          <p className="text-gray-600 mt-1">
            Tạo và quản lý các mã giảm giá cho khách hàng
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn btn-primary flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo mã giảm giá</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm mã giảm giá..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input pl-10"
              />
            </div>
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="input"
            >
              <option value="">Tất cả loại</option>
              <option value="percentage">Phần trăm</option>
              <option value="fixed">Số tiền</option>
              <option value="free_shipping">Miễn ship</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="active">Hoạt động</option>
              <option value="inactive">Tạm dừng</option>
              <option value="expired">Hết hạn</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <Tag className="w-8 h-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Tổng mã giảm giá</p>
              <p className="text-2xl font-bold text-gray-900">{coupons.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Đang hoạt động</p>
              <p className="text-2xl font-bold text-gray-900">
                {coupons.filter(c => c.status === 'active' && new Date(c.expiresAt) >= new Date()).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-purple-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Lượt sử dụng</p>
              <p className="text-2xl font-bold text-gray-900">
                {coupons.reduce((sum, coupon) => sum + (coupon.usedCount || 0), 0)}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <Clock className="w-8 h-8 text-red-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Hết hạn</p>
              <p className="text-2xl font-bold text-gray-900">
                {coupons.filter(c => new Date(c.expiresAt) < new Date()).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Coupons Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mã giảm giá
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Giá trị
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sử dụng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thời hạn
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCoupons.length > 0 ? (
                filteredCoupons.map(coupon => (
                  <CouponRow key={coupon.id} coupon={coupon} />
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <Tag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Không tìm thấy mã giảm giá nào</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || editingCoupon) && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => {
              setShowCreateModal(false)
              setEditingCoupon(null)
              resetForm()
            }}></div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <form onSubmit={editingCoupon ? handleUpdateCoupon : handleCreateCoupon}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-6">
                    {editingCoupon ? 'Chỉnh sửa mã giảm giá' : 'Tạo mã giảm giá mới'}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Coupon Code */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mã giảm giá *
                      </label>
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={formData.code}
                          onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                          className="input flex-1 font-mono"
                          placeholder="VD: WELCOME10"
                          required
                        />
                        <button
                          type="button"
                          onClick={generateCouponCode}
                          className="btn btn-outline"
                        >
                          Tạo tự động
                        </button>
                      </div>
                    </div>

                    {/* Name */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tên mã giảm giá *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="input"
                        placeholder="VD: Chào mừng khách hàng mới"
                        required
                      />
                    </div>

                    {/* Description */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mô tả
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        className="input"
                        rows={2}
                        placeholder="Mô tả chi tiết về mã giảm giá"
                      />
                    </div>

                    {/* Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Loại giảm giá *
                      </label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData({...formData, type: e.target.value})}
                        className="input"
                        required
                      >
                        <option value="percentage">Phần trăm (%)</option>
                        <option value="fixed">Số tiền cố định (đ)</option>
                        <option value="free_shipping">Miễn phí vận chuyển</option>
                      </select>
                    </div>

                    {/* Value */}
                    {formData.type !== 'free_shipping' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Giá trị giảm *
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            value={formData.value}
                            onChange={(e) => setFormData({...formData, value: e.target.value})}
                            className="input pr-8"
                            placeholder={formData.type === 'percentage' ? '10' : '50000'}
                            min="0"
                            max={formData.type === 'percentage' ? '100' : undefined}
                            required
                          />
                          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                            {formData.type === 'percentage' ? '%' : 'đ'}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Min Order Amount */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Đơn hàng tối thiểu
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={formData.minOrderAmount}
                          onChange={(e) => setFormData({...formData, minOrderAmount: e.target.value})}
                          className="input pr-8"
                          placeholder="100000"
                          min="0"
                        />
                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">đ</span>
                      </div>
                    </div>

                    {/* Max Discount Amount */}
                    {formData.type === 'percentage' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Giảm tối đa
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            value={formData.maxDiscountAmount}
                            onChange={(e) => setFormData({...formData, maxDiscountAmount: e.target.value})}
                            className="input pr-8"
                            placeholder="50000"
                            min="0"
                          />
                          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">đ</span>
                        </div>
                      </div>
                    )}

                    {/* Usage Limit */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Giới hạn sử dụng
                      </label>
                      <input
                        type="number"
                        value={formData.usageLimit}
                        onChange={(e) => setFormData({...formData, usageLimit: e.target.value})}
                        className="input"
                        placeholder="Để trống = không giới hạn"
                        min="1"
                      />
                    </div>

                    {/* Start Date */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ngày bắt đầu *
                      </label>
                      <input
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                        className="input"
                        required
                      />
                    </div>

                    {/* End Date */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ngày kết thúc *
                      </label>
                      <input
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                        className="input"
                        min={formData.startDate}
                        required
                      />
                    </div>

                    {/* Status */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Trạng thái
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({...formData, status: e.target.value})}
                        className="input"
                      >
                        <option value="active">Hoạt động</option>
                        <option value="inactive">Tạm dừng</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="btn btn-primary sm:ml-3 sm:w-auto"
                  >
                    {editingCoupon ? 'Cập nhật' : 'Tạo mã'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false)
                      setEditingCoupon(null)
                      resetForm()
                    }}
                    className="btn btn-outline mt-3 sm:mt-0 sm:w-auto"
                  >
                    Hủy
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminCoupons
