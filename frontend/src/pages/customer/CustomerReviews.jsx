import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Star,
  Plus,
  Edit,
  Trash2,
  Eye,
  Calendar,
  Package,
  ThumbsUp,
  MessageCircle,
  Image as ImageIcon
} from 'lucide-react'
import { formatPrice } from '../../data/mockData'
import { useAuthStore } from '../../store/authStore'
import { reviewAPI } from '../../services/api'
import toast from 'react-hot-toast'

const CustomerReviews = () => {
  const { user } = useAuthStore()
  const [reviews, setReviews] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all, pending, published

  useEffect(() => {
    fetchReviews()
  }, [])

  const fetchReviews = async () => {
    try {
      setIsLoading(true)
      const response = await reviewAPI.getMyReviews()
      
      if (response.data.status === 'success') {
        setReviews(response.data.data.reviews)
      }
    } catch (error) {
      console.error('Failed to fetch reviews:', error)
      toast.error('Không thể tải danh sách đánh giá')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteReview = async (reviewId) => {
    if (!confirm('Bạn có chắc chắn muốn xóa đánh giá này?')) return

    try {
      await reviewAPI.deleteReview(reviewId)
      setReviews(reviews.filter(review => review.id !== reviewId))
      toast.success('Xóa đánh giá thành công')
    } catch (error) {
      console.error('Failed to delete review:', error)
      toast.error('Không thể xóa đánh giá')
    }
  }

  const filteredReviews = reviews.filter(review => {
    if (filter === 'all') return true
    if (filter === 'pending') return review.status === 'pending'
    if (filter === 'approved') return review.status === 'approved'
    if (filter === 'rejected') return review.status === 'rejected'
    return true
  })

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating
            ? 'text-yellow-400 fill-current'
            : 'text-gray-300'
        }`}
      />
    ))
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const ReviewCard = ({ review }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-4">
          <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
            <img
              src={review.product?.images?.[0]?.imageUrl || '/placeholder-product.jpg'}
              alt={review.product?.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{review.product?.name}</h3>
            <div className="flex items-center mt-1">
              {renderStars(review.rating)}
              <span className="ml-2 text-sm text-gray-600">({review.rating}/5)</span>
            </div>
            <div className="flex items-center mt-1 text-sm text-gray-500">
              <Calendar className="w-4 h-4 mr-1" />
              {formatDate(review.created_at)}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            review.status === 'approved'
              ? 'bg-green-100 text-green-800'
              : review.status === 'rejected'
              ? 'bg-red-100 text-red-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {review.status === 'approved' 
              ? 'Đã duyệt' 
              : review.status === 'rejected'
              ? 'Từ chối'
              : 'Chờ duyệt'}
          </span>

          <button
            onClick={() => handleDeleteReview(review.id)}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-gray-700">{review.comment}</p>
      </div>

      {review.images && review.images.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center space-x-2 overflow-x-auto">
            {review.images.map((image, index) => (
              <div key={index} className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                <img
                  src={image}
                  alt={`Review image ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="flex items-center space-x-4 text-sm text-gray-500">
          <div className="flex items-center">
            <ThumbsUp className="w-4 h-4 mr-1" />
            <span>{review.helpfulCount || 0} hữu ích</span>
          </div>
          <div className="flex items-center">
            <MessageCircle className="w-4 h-4 mr-1" />
            <span>{review.replyCount || 0} phản hồi</span>
          </div>
        </div>

        <Link
          to={`/products/${review.product.id}#reviews`}
          className="btn btn-outline btn-sm flex items-center space-x-2"
        >
          <Eye className="w-4 h-4" />
          <span>Xem sản phẩm</span>
        </Link>
      </div>
    </div>
  )

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
          <h1 className="text-2xl font-bold text-gray-900">Đánh giá của tôi</h1>
          <p className="text-gray-600 mt-1">
            Quản lý các đánh giá sản phẩm bạn đã viết
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-700">Lọc theo:</span>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                filter === 'all'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Tất cả ({reviews.length})
            </button>
            <button
              onClick={() => setFilter('approved')}
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                filter === 'approved'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Đã duyệt ({reviews.filter(r => r.status === 'approved').length})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                filter === 'pending'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Chờ duyệt ({reviews.filter(r => r.status === 'pending').length})
            </button>
            <button
              onClick={() => setFilter('rejected')}
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                filter === 'rejected'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Từ chối ({reviews.filter(r => r.status === 'rejected').length})
            </button>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div>
        {filteredReviews.length > 0 ? (
          <div className="space-y-4">
            {filteredReviews.map(review => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <Star className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Chưa có đánh giá nào
            </h3>
            <p className="text-gray-500 mb-6">
              Bạn chưa viết đánh giá cho sản phẩm nào. Hãy mua sắm và chia sẻ trải nghiệm của bạn!
            </p>
            <div className="space-y-3">
              <Link
                to="/customer/orders"
                className="btn btn-primary"
              >
                Xem đơn hàng đã mua
              </Link>
              <div>
                <Link
                  to="/products"
                  className="btn btn-outline"
                >
                  Khám phá sản phẩm
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Pending Reviews Notice */}
      {reviews.some(r => r.status === 'pending') && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <MessageCircle className="w-5 h-5 text-yellow-600" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Đánh giá đang chờ duyệt
              </h3>
              <p className="text-sm text-yellow-700 mt-1">
                Một số đánh giá của bạn đang được kiểm duyệt và sẽ được hiển thị công khai sau khi được phê duyệt.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CustomerReviews
