import { Link } from 'react-router-dom'
import { Star, ShoppingCart, Heart } from 'lucide-react'
import { formatPrice, getDiscountPercentage } from '../../data/mockData'
import { useCartStore } from '../../store/cartStore'
import toast from 'react-hot-toast'

const ProductCard = ({ product, className = '' }) => {
  const { addItem } = useCartStore()
  const discountPercentage = getDiscountPercentage(product.price, product.comparePrice)

  const handleAddToCart = async (e) => {
    e.preventDefault()
    try {
      await addItem(product.id, 1)
      toast.success(`Đã thêm ${product.name} vào giỏ hàng`)
    } catch (error) {
      toast.error('Không thể thêm sản phẩm vào giỏ hàng')
    }
  }

  return (
    <div className={`bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group ${className}`}>
      <div className="relative">
        <Link to={`/products/${product.id}`}>
          <img
            src={product.images?.[0]?.imageUrl || 'https://via.placeholder.com/400x300'}
            alt={product.images?.[0]?.altText || product.name}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
          />
        </Link>
        
        {/* Discount Badge */}
        {discountPercentage > 0 && (
          <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-sm font-medium">
            -{discountPercentage}%
          </div>
        )}
        
        {/* Wishlist Button */}
        <button className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-sm hover:shadow-md transition-shadow duration-200 opacity-0 group-hover:opacity-100">
          <Heart className="w-4 h-4 text-gray-600 hover:text-red-500 transition-colors duration-200" />
        </button>
        
        {/* Stock Status */}
        {product.status !== 'active' && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="text-white font-medium">
              {product.status === 'out_of_stock' ? 'Hết hàng' : 'Không khả dụng'}
            </span>
          </div>
        )}
      </div>
      
      <div className="p-4">
        <Link to={`/products/${product.id}`}>
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-blue-600 transition-colors duration-200">
            {product.name}
          </h3>
        </Link>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {product.shortDescription}
        </p>
        
        {/* Rating */}
        <div className="flex items-center mb-3">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < Math.floor(product.averageRating || 0)
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-gray-500 ml-2">
            {product.averageRating > 0 ? (
              <>({parseFloat(product.averageRating).toFixed(1)}) • {product.reviewCount || 0} đánh giá</>
            ) : (
              <>Chưa có đánh giá</>
            )}
          </span>
        </div>
        
        {/* Price and Add to Cart */}
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
            onClick={handleAddToCart}
            className="flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={product.status !== 'active'}
          >
            <ShoppingCart className="w-4 h-4 mr-1" />
            <span className="text-sm">Thêm</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProductCard
