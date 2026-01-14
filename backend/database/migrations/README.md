# Database Migration - Product Images Update

## Mô tả

Migration này thêm cột `thumbnail_url` vào bảng `product_images` và cho phép `product_id` nullable để hỗ trợ upload ảnh trước khi gán cho sản phẩm.

## Cách chạy migration

### Sử dụng MySQL CLI

```bash
mysql -u root -p bach_hoa < backend/database/migrations/add-thumbnail-url-to-product-images.sql
```

### Sử dụng phpMyAdmin

1. Mở phpMyAdmin tại http://localhost:8080
2. Đăng nhập với:
   - Username: root
   - Password: root123
3. Chọn database `bach_hoa`
4. Vào tab SQL
5. Copy nội dung file migration và paste vào
6. Click Execute

### Sử dụng Docker

```bash
docker exec -i bach_hoa_db mysql -uroot -proot123 bach_hoa < backend/database/migrations/add-thumbnail-url-to-product-images.sql
```

## Thay đổi

1. **Thêm cột `thumbnail_url`**: Lưu URL của ảnh thumbnail (kích thước nhỏ)
2. **Cho phép `product_id` NULL**: Ảnh có thể tồn tại độc lập trước khi được gán cho sản phẩm
3. **Thêm indexes**: Cải thiện hiệu suất truy vấn

## Rollback

Nếu cần rollback:

```sql
ALTER TABLE product_images DROP COLUMN thumbnail_url;
ALTER TABLE product_images MODIFY COLUMN product_id INT NOT NULL;
```
