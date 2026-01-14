import { Link } from 'react-router-dom'
import { Home, ArrowLeft } from 'lucide-react'

const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center px-4">
        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="text-9xl font-bold text-primary-500 mb-4">404</div>
          <div className="w-24 h-1 bg-accent-500 mx-auto rounded-full"></div>
        </div>

        {/* Error Message */}
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Trang không tồn tại
        </h1>
        <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
          Xin lỗi, trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => window.history.back()}
            className="btn btn-outline inline-flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </button>
          
          <Link
            to="/"
            className="btn btn-primary inline-flex items-center"
          >
            <Home className="w-4 h-4 mr-2" />
            Về trang chủ
          </Link>
        </div>

        {/* Additional Links */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-gray-500 mb-4">Hoặc bạn có thể:</p>
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <Link
              to="/products"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Xem sản phẩm
            </Link>
            <Link
              to="/contact"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Liên hệ hỗ trợ
            </Link>
            <Link
              to="/about"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Về chúng tôi
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NotFoundPage
