# Bach Hoa Store - Website Bách Hóa Hiện Đại

Một website bách hóa trực tuyến được xây dựng với React, Node.js, MySQL và Socket.IO, cung cấp trải nghiệm mua sắm tuyệt vời với giao diện đẹp mắt và tính năng real-time.

## 🌟 Tính Năng Chính

### 🛒 Hệ Thống Khách Hàng
- ✅ Đăng ký/Đăng nhập với xác thực email
- ✅ Quên mật khẩu và đặt lại mật khẩu
- ✅ Quản lý hồ sơ cá nhân và địa chỉ
- ✅ Tìm kiếm và lọc sản phẩm theo nhiều tiêu chí
- ✅ Giỏ hàng với tính năng lưu trữ
- ✅ Đặt hàng với nhiều phương thức thanh toán
- ✅ Áp dụng mã giảm giá
- ✅ Theo dõi đơn hàng real-time
- ✅ Đánh giá và review sản phẩm

### 👨‍💼 Hệ Thống Nhân Viên
- ✅ Dashboard với thống kê cơ bản
- ✅ Xử lý đơn hàng (xác nhận, hủy, cập nhật trạng thái)
- ✅ Tạo đơn hàng thủ công cho khách
- ✅ Cập nhật trạng thái sản phẩm
- ✅ Xem báo cáo bán hàng

### 👑 Hệ Thống Admin
- ✅ Dashboard tổng quan với biểu đồ
- ✅ Quản lý người dùng và phân quyền
- ✅ CRUD sản phẩm với upload ảnh
- ✅ Quản lý danh mục nhiều cấp
- ✅ Quản lý đơn hàng toàn diện
- ✅ Hệ thống mã giảm giá
- ✅ Import/Export Excel
- ✅ Báo cáo chi tiết

## 🎨 Thiết Kế & UI/UX

### Màu Sắc Chính
- **Primary**: `#2196F3` (Xanh dương) - Header, link, tiêu đề
- **Secondary**: `#FFFFFF` (Trắng) - Nền chính
- **Accent**: `#FF9800` (Cam) - CTA, nút "Mua ngay", banner giảm giá

### Đặc Điểm Giao Diện
- ✅ Responsive design (mobile-first)
- ✅ Typography hiện đại với font Inter
- ✅ Icon set từ Lucide React
- ✅ Skeleton loading cho UX tốt hơn
- ✅ Animations mượt mà với Framer Motion
- ✅ Tương phản đạt chuẩn WCAG AA

## 🏗️ Kiến Trúc Hệ Thống

### Frontend (React + Vite)
```
src/
├── components/          # UI components tái sử dụng
├── pages/              # Các trang chính
├── layouts/            # Layout components
├── store/              # Zustand stores
├── services/           # API services
├── hooks/              # Custom hooks
├── utils/              # Utility functions
└── assets/             # Static assets
```

### Backend (Node.js + Express)
```
src/
├── controllers/        # Route controllers
├── models/            # Sequelize models
├── routes/            # API routes
├── middlewares/       # Custom middlewares
├── services/          # Business logic services
├── utils/             # Utility functions
└── database/          # Database config & migrations
```

## 🚀 Cài Đặt và Chạy Dự Án

### Yêu Cầu Hệ Thống
- Node.js 18+
- MySQL 8.0+
- Docker & Docker Compose (tùy chọn)

### 1. Clone Repository
```bash
git clone <repository-url>
cd BachHoa
```

### 2. Cài Đặt Dependencies
```bash
# Cài đặt tất cả dependencies
npm run install:all

# Hoặc cài đặt từng phần
cd frontend && npm install
cd ../backend && npm install
```

### 3. Cấu Hình Environment

#### Backend (.env)
```bash
cp backend/.env.example backend/.env
```

Cập nhật các giá trị trong `backend/.env`:
```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=bach_hoa
DB_USER=bach_hoa_user
DB_PASSWORD=bach_hoa_pass

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key

# Email (Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

#### Frontend (.env)
```bash
cp frontend/.env.example frontend/.env
```

### 4. Chạy với Docker (Khuyến nghị)
```bash
# Khởi động tất cả services
npm run docker:up

# Chạy seed data
npm run seed
```

### 5. Chạy Development Mode
```bash
# Terminal 1: Start backend
cd backend && npm run dev

# Terminal 2: Start frontend
cd frontend && npm run dev

# Terminal 3: Seed database (chỉ chạy 1 lần)
cd backend && npm run seed
```

## 🔗 URLs và Truy Cập

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **phpMyAdmin**: http://localhost:8080
- **API Documentation**: http://localhost:5000/api/v1/health

## 👥 Tài Khoản Demo

### Admin
- **Email**: admin@bachhoa.com
- **Password**: Admin123!

### Staff
- **Email**: staff@bachhoa.com
- **Password**: Staff123!

### Customer
- **Email**: customer@bachhoa.com
- **Password**: Customer123!

## 📊 Database Schema

### Bảng Chính
- `users` - Thông tin người dùng
- `roles` - Vai trò và quyền hạn
- `products` - Sản phẩm
- `categories` - Danh mục sản phẩm
- `orders` - Đơn hàng
- `order_items` - Chi tiết đơn hàng
- `coupons` - Mã giảm giá
- `reviews` - Đánh giá sản phẩm
- `inventory` - Quản lý tồn kho

## 🛠️ Scripts Hữu Ích

```bash
# Development
npm run dev                 # Chạy cả frontend và backend
npm run dev:frontend       # Chỉ chạy frontend
npm run dev:backend        # Chỉ chạy backend

# Production
npm run build              # Build cả frontend và backend
npm run start              # Chạy production server

# Database
npm run seed               # Tạo dữ liệu mẫu
npm run migrate            # Chạy migrations

# Docker
npm run docker:up          # Khởi động containers
npm run docker:down        # Dừng containers
npm run docker:build       # Build lại images

# Testing
npm run test               # Chạy tests
npm run test:frontend      # Test frontend
npm run test:backend       # Test backend
```

## 🔧 Tính Năng Kỹ Thuật

### Real-time Features (Socket.IO)
- ✅ Theo dõi trạng thái đơn hàng real-time
- ✅ Thông báo đơn hàng mới cho staff
- ✅ Cảnh báo tồn kho thấp
- ✅ Thông báo hệ thống

### Security
- ✅ JWT Authentication với Refresh Token
- ✅ BCrypt password hashing
- ✅ CORS protection
- ✅ Helmet security headers
- ✅ Rate limiting
- ✅ Input validation & sanitization

### Performance
- ✅ Image optimization với Sharp
- ✅ Gzip compression
- ✅ Database indexing
- ✅ Query optimization
- ✅ Caching strategies

## 📱 Responsive Design

Website được tối ưu cho tất cả thiết bị:
- 📱 Mobile (320px+)
- 📱 Tablet (768px+)
- 💻 Desktop (1024px+)
- 🖥️ Large screens (1440px+)

## 🧪 Testing

```bash
# Chạy tất cả tests
npm run test

# Test với coverage
npm run test:coverage

# Test watch mode
npm run test:watch
```

## 📦 Deployment

### Docker Production
```bash
# Build production images
npm run docker:build

# Deploy với docker-compose
docker-compose -f docker-compose.prod.yml up -d
```

### Manual Deployment
```bash
# Build frontend
cd frontend && npm run build

# Start backend
cd backend && npm start
```

## 🤝 Đóng Góp

1. Fork repository
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

## 📄 License

Dự án này được phân phối dưới giấy phép MIT. Xem file `LICENSE` để biết thêm chi tiết.

## 📞 Hỗ Trợ

- 📧 Email: support@bachhoa.com
- 🐛 Issues: [GitHub Issues](https://github.com/your-repo/issues)
- 📖 Documentation: [Wiki](https://github.com/your-repo/wiki)

---

**Bach Hoa Store** - Mang đến trải nghiệm mua sắm tuyệt vời! 🛒✨
