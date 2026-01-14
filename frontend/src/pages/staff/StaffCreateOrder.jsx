import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search,
  Plus,
  Minus,
  Trash2,
  User,
  Phone,
  MapPin,
  Package,
  ShoppingCart,
  Calculator,
  ArrowLeft
} from 'lucide-react'
import useProductStore from '../../store/productStore'
import { formatPrice } from '../../data/mockData'
import { orderAPI } from '../../services/api'
import toast from 'react-hot-toast'

const StaffCreateOrder = () => {
  const navigate = useNavigate()
  const { products, fetchProducts } = useProductStore()

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedProducts, setSelectedProducts] = useState([])
  const [customerInfo, setCustomerInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: ''
  })
  const [paymentMethod, setPaymentMethod] = useState('cod')
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
    product.status === 'active' &&
    (product.inventory?.quantity || 0) > 0
  )

  const addProduct = (product) => {
    const existingItem = selectedProducts.find(item => item.id === product.id)

    if (existingItem) {
      if (existingItem.quantity < (product.inventory?.quantity || 0)) {
        setSelectedProducts(selectedProducts.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ))
      } else {
        toast.error('Không đủ hàng trong kho')
      }
    } else {
      setSelectedProducts([...selectedProducts, {
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        maxQuantity: product.inventory?.quantity || 0,
        image: product.images?.[0]?.imageUrl
      }])
    }
  }

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeProduct(productId)
      return
    }

    const product = selectedProducts.find(item => item.id === productId)
    if (newQuantity > product.maxQuantity) {
      toast.error('Không đủ hàng trong kho')
      return
    }

    setSelectedProducts(selectedProducts.map(item =>
      item.id === productId
        ? { ...item, quantity: newQuantity }
        : item
    ))
  }

  const removeProduct = (productId) => {
    setSelectedProducts(selectedProducts.filter(item => item.id !== productId))
  }

  const calculateSubtotal = () => {
    return selectedProducts.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  }

  const calculateTotal = () => {
    const subtotal = calculateSubtotal()
    const shippingFee = 30000 // Fixed shipping fee
    return subtotal + shippingFee
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (selectedProducts.length === 0) {
      toast.error('Vui lòng chọn ít nhất một sản phẩm')
      return
    }

    if (!customerInfo.firstName || !customerInfo.lastName || !customerInfo.phone) {
      toast.error('Vui lòng điền đầy đủ thông tin khách hàng')
      return
    }

    setIsSubmitting(true)

    try {
      // Prepare order data for API
      const orderData = {
        // Customer info
        customerName: `${customerInfo.firstName} ${customerInfo.lastName}`,
        customerEmail: customerInfo.email,
        customerPhone: customerInfo.phone,

        // Shipping address
        shippingAddress: {
          recipientName: `${customerInfo.firstName} ${customerInfo.lastName}`,
          recipientPhone: customerInfo.phone,
          addressLine1: customerInfo.address,
          ward: 'Phường 1', // Default values
          district: 'Quận 1',
          city: 'TP.HCM'
        },

        // Order items
        items: selectedProducts.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price
        })),

        // Payment and totals
        paymentMethod: paymentMethod,
        subtotal: calculateSubtotal(),
        shippingFee: 30000,
        total: calculateTotal(),
        notes: notes || '',

        // Staff created order
        createdBy: 'staff'
      }

      console.log('Creating order:', orderData)

      // Call real API
      const response = await orderAPI.createOrder(orderData)
      console.log('Order created:', response.data)

      toast.success('Tạo đơn hàng thành công!')
      navigate('/staff/orders')
    } catch (error) {
      console.error('Create order error:', error)
      toast.error(error.response?.data?.message || 'Không thể tạo đơn hàng')
    } finally {
      setIsSubmitting(false)
    }
  }

  const ProductSearchItem = ({ product }) => (
    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden">
          <img
            src={product.images?.[0]?.imageUrl || '/placeholder-product.jpg'}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <h4 className="font-medium text-gray-900">{product.name}</h4>
          <p className="text-sm text-gray-500">
            Còn: {product.inventory?.quantity || 0} • {formatPrice(product.price)}
          </p>
        </div>
      </div>
      <button
        onClick={() => addProduct(product)}
        className="btn btn-primary btn-sm flex items-center space-x-1"
      >
        <Plus className="w-4 h-4" />
        <span>Thêm</span>
      </button>
    </div>
  )

  const SelectedProductItem = ({ item }) => (
    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden">
          <img
            src={item.image || '/placeholder-product.jpg'}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <h4 className="font-medium text-gray-900">{item.name}</h4>
          <p className="text-sm text-gray-500">{formatPrice(item.price)}</p>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => updateQuantity(item.id, item.quantity - 1)}
            className="p-1 text-gray-400 hover:text-gray-600"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="w-8 text-center font-medium">{item.quantity}</span>
          <button
            onClick={() => updateQuantity(item.id, item.quantity + 1)}
            className="p-1 text-gray-400 hover:text-gray-600"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <div className="text-right min-w-[80px]">
          <p className="font-medium text-gray-900">
            {formatPrice(item.price * item.quantity)}
          </p>
        </div>

        <button
          onClick={() => removeProduct(item.id)}
          className="p-1 text-red-400 hover:text-red-600"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/staff/orders')}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tạo đơn hàng mới</h1>
            <p className="text-gray-600 mt-1">
              Tạo đơn hàng cho khách hàng tại cửa hàng
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Product Selection */}
        <div className="lg:col-span-2 space-y-6">
          {/* Product Search */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Chọn sản phẩm</h3>

            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input pl-10"
              />
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredProducts.length > 0 ? (
                filteredProducts.map(product => (
                  <ProductSearchItem key={product.id} product={product} />
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  {searchQuery ? 'Không tìm thấy sản phẩm nào' : 'Nhập tên sản phẩm để tìm kiếm'}
                </div>
              )}
            </div>
          </div>

          {/* Selected Products */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <ShoppingCart className="w-5 h-5 mr-2" />
              Sản phẩm đã chọn ({selectedProducts.length})
            </h3>

            {selectedProducts.length > 0 ? (
              <div className="space-y-3">
                {selectedProducts.map(item => (
                  <SelectedProductItem key={item.id} item={item} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Chưa có sản phẩm nào được chọn
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Customer Info & Order Summary */}
        <div className="space-y-6">
          {/* Customer Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2" />
              Thông tin khách hàng
            </h3>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Họ *
                  </label>
                  <input
                    type="text"
                    value={customerInfo.firstName}
                    onChange={(e) => setCustomerInfo({...customerInfo, firstName: e.target.value})}
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tên *
                  </label>
                  <input
                    type="text"
                    value={customerInfo.lastName}
                    onChange={(e) => setCustomerInfo({...customerInfo, lastName: e.target.value})}
                    className="input"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số điện thoại *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="tel"
                    value={customerInfo.phone}
                    onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                    className="input pl-10"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={customerInfo.email}
                  onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Địa chỉ giao hàng
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <textarea
                    value={customerInfo.address}
                    onChange={(e) => setCustomerInfo({...customerInfo, address: e.target.value})}
                    className="input pl-10 resize-none"
                    rows={3}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Phương thức thanh toán
            </h3>

            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="cod"
                  checked={paymentMethod === 'cod'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mr-3"
                />
                <span>Thanh toán khi nhận hàng (COD)</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="cash"
                  checked={paymentMethod === 'cash'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mr-3"
                />
                <span>Thanh toán tiền mặt</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="card"
                  checked={paymentMethod === 'card'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mr-3"
                />
                <span>Thanh toán thẻ</span>
              </label>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Calculator className="w-5 h-5 mr-2" />
              Tổng kết đơn hàng
            </h3>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Tạm tính:</span>
                <span>{formatPrice(calculateSubtotal())}</span>
              </div>
              <div className="flex justify-between">
                <span>Phí vận chuyển:</span>
                <span>{formatPrice(30000)}</span>
              </div>
              <div className="border-t border-gray-200 pt-3">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Tổng cộng:</span>
                  <span className="text-green-600">{formatPrice(calculateTotal())}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Ghi chú
            </h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="input resize-none"
              rows={3}
              placeholder="Ghi chú thêm cho đơn hàng..."
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || selectedProducts.length === 0}
            className="btn btn-primary w-full flex items-center justify-center space-x-2"
          >
            {isSubmitting ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" />
                <span>Tạo đơn hàng</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default StaffCreateOrder
