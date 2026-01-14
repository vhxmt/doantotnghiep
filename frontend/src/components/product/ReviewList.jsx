import { useState } from 'react'
import { Star, ThumbsUp, User, Calendar, CheckCircle } from 'lucide-react'
import { toast } from 'react-hot-toast'
import api from '../../services/api'

const ReviewList = ({ productId, reviews, statistics, onReviewAdded }) => {
  const [filter, setFilter] = useState('all')

  const handleHelpful = async (reviewId) => {
    try {
      await api.post(`/reviews/${reviewId}/helpful`)
      toast.success('Cảm ơn đánh giá của bạn!')
      onReviewAdded() // Refresh reviews
    } catch (error) {
      toast.error('Không thể đánh giá hữu ích')
    }
  }

  const filteredReviews = filter === 'all' 
    ? reviews 
    : reviews.filter(r => r.rating === parseInt(filter))

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      {statistics && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Overall Rating */}
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                <span className="text-5xl font-bold text-gray-900">
                  {statistics.averageRating?.toFixed(1) || 0}
                </span>
                <div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < Math.round(statistics.averageRating)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {statistics.totalReviews} đánh giá
                  </p>
                </div>
              </div>
            </div>

            {/* Rating Distribution */}
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = statistics.distribution?.[rating] || 0
                const percentage = statistics.totalReviews 
                  ? (count / statistics.totalReviews) * 100 
                  : 0

                return (
                  <button
                    key={rating}
                    onClick={() => setFilter(rating.toString())}
                    className={`w-full flex items-center gap-2 text-sm hover:bg-gray-50 p-2 rounded transition-colors ${
                      filter === rating.toString() ? 'bg-blue-50' : ''
                    }`}
                  >
                    <span className="flex items-center gap-1 w-16">
                      <span>{rating}</span>
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    </span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-yellow-400 h-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-gray-600 w-12 text-right">
                      {count}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-2 mt-4 pt-4 border-t">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Tất cả
            </button>
            {[5, 4, 3, 2, 1].map((rating) => (
              <button
                key={rating}
                onClick={() => setFilter(rating.toString())}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === rating.toString()
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {rating} <Star className="inline w-3 h-3 fill-current" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.length > 0 ? (
          filteredReviews.map((review) => (
            <div
              key={review.id}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              {/* Review Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {review.user?.firstName && review.user?.lastName 
                        ? `${review.user.firstName} ${review.user.lastName}` 
                        : 'Anonymous'}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="w-3 h-3" />
                      {new Date(review.created_at).toLocaleDateString('vi-VN')}
                      {review.status === 'approved' && (
                        <span className="flex items-center gap-1 text-green-600">
                          <CheckCircle className="w-3 h-3" />
                          Đã mua hàng
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Rating Stars */}
              <div className="flex items-center gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < review.rating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>

              {/* Review Title */}
              {review.title && (
                <h4 className="font-semibold text-gray-900 mb-2">
                  {review.title}
                </h4>
              )}

              {/* Review Comment */}
              {review.comment && (
                <p className="text-gray-700 mb-3 whitespace-pre-line">
                  {review.comment}
                </p>
              )}

              {/* Helpful Button */}
              <div className="flex items-center gap-4 pt-3 border-t">
                <button
                  onClick={() => handleHelpful(review.id)}
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors"
                >
                  <ThumbsUp className="w-4 h-4" />
                  <span>Hữu ích ({review.helpfulCount || 0})</span>
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <p className="text-gray-500">
              {filter === 'all' 
                ? 'Chưa có đánh giá nào' 
                : `Chưa có đánh giá ${filter} sao`}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ReviewList
