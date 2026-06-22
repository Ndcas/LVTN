# Implement Authentication & Authorization cho User Service

Mục tiêu: Xây dựng luồng xác thực (Authentication) và phân quyền (Authorization) sử dụng Email cho việc đăng ký/khôi phục mật khẩu, kết hợp Bcrypt (10 rounds) cho mã hóa mật khẩu và JWT (Access Token 10 phút, Refresh Token 30 ngày) cho quản lý phiên đăng nhập.

> [!WARNING]
> Kế hoạch này áp dụng thay đổi kiến trúc quan trọng cho hệ thống: Sử dụng Email làm định danh chính (thay vì Phone) và định hướng lại cách API Gateway xử lý Auth.

## 1. Kiến trúc Đã Chốt (Đã thống nhất)

- **Trường `phone`:** Vẫn bắt buộc nhập và giữ thuộc tính `unique` theo chuẩn DB, đóng vai trò lưu trữ thông tin liên lạc. Quá trình đăng nhập/khôi phục mật khẩu sẽ thao tác chính qua Email.
- **Xác thực JWT:** **API Gateway** sẽ trực tiếp giải mã và xác thực Access Token thông qua `JWT_SECRET` dùng chung. User Service chỉ làm nhiệm vụ cấp phát token, cấp mới (refresh) và chặn (block/revoke) token.
- **Lưu trữ & Revoke Token:** Sử dụng **Redis Blacklist** để lưu trữ các Refresh Token (hoặc Access Token nếu cần đăng xuất khẩn cấp) bị vô hiệu hóa. Điều này giúp giảm tải I/O cho Database và đảm bảo tốc độ phản hồi cực nhanh.

## 2. Proposed Changes (Các thay đổi đề xuất)

### 2.1 Cập nhật Dependencies
**Target:** `backend/services/user/package.json` & `backend/api/package.json`
- Cài đặt `bcrypt`, `@types/bcrypt` (Cho mã hóa mật khẩu).
- Cài đặt `@nestjs/jwt`, `@nestjs/passport`, `passport-jwt` (Cho JWT Auth).
- Cài đặt `@nestjs-modules/mailer`, `nodemailer` (Cho việc gửi Email SMTP - Forgot Password).
- Cài đặt `ioredis` (Cho việc lưu trữ Redis Blacklist).

### 2.2 Cấu trúc Database (User Service)
- Giữ nguyên cấu trúc bảng `users`, không thêm `rt_hash` do đã chuyển sang dùng Redis Blacklist. `phone` vẫn là trường bắt buộc (không đổi thành nullable).

### 2.3 Thêm Auth Module (User Service)
Tạo mới module `Auth` để tách biệt logic đăng nhập/đăng ký khỏi logic quản lý thông tin User:
#### [NEW] `src/modules/auth/auth.module.ts`
#### [NEW] `src/modules/auth/auth.controller.ts`
- Cung cấp các gRPC endpoint phục vụ API Gateway.
#### [NEW] `src/modules/auth/auth.service.ts`
- `register`: Sinh salt (10 rounds), hash password, tạo User.
- `login`: So sánh mật khẩu `bcrypt.compare`, tạo cặp Access Token (10m) & Refresh Token (30d).
- `refreshToken`: Kiểm tra RT có nằm trong Redis Blacklist không. Nếu hợp lệ, cấp cặp token mới.
- `logout`/`revoke`: Đẩy Refresh Token vào Redis Blacklist với TTL bằng thời hạn còn lại của token.
- `forgotPassword`: Sinh OTP/Token gửi qua Email.

### 2.4 Cập nhật Protobuf (Giao tiếp gRPC)
#### [MODIFY] `backend/protos/user.proto`
Thêm các message và service definitions cho luồng Auth:
```protobuf
service AuthService {
  rpc Register(RegisterRequest) returns (AuthResponse);
  rpc Login(LoginRequest) returns (AuthResponse);
  rpc Refresh(RefreshRequest) returns (AuthResponse);
  rpc ForgotPassword(ForgotPasswordRequest) returns (BaseResponse);
}
```

### 2.5 Cập nhật API Gateway
#### [NEW] `backend/api/src/modules/auth/auth.controller.ts`
- Cung cấp các HTTP REST/GraphQL API cho Client (`POST /auth/login`, `POST /auth/register`, `POST /auth/refresh`).
#### [NEW] `backend/api/src/guards/jwt-auth.guard.ts`
- Triển khai global/local Guard tại API Gateway để decode JWT.
- Đính kèm thông tin User (gồm `id`, `role`, `email`) vào HTTP Request (`req.user`) để các service khác (như Schedule, Medical Record) dùng dưới dạng định danh (Logical ID).

## 3. Verification Plan

### Manual Verification
1. Gọi API `POST /auth/register` với Email & Password -> Kiểm tra MySQL xem Password đã được mã hóa bằng Bcrypt chưa.
2. Gọi API `POST /auth/login` -> Kiểm tra response trả về đủ `accessToken` và `refreshToken`.
3. Giải mã thử Access Token xem có đúng thời hạn 10 phút và chứa thông tin `role`, `userId` hay không.
4. Gọi API `POST /auth/refresh` bằng Refresh Token -> Kiểm tra hệ thống trả về cặp token mới, đồng thời Refresh Token cũ bị đẩy vào Redis Blacklist.
5. Gọi một API được bảo vệ (VD: Lấy thông tin cá nhân) với Access Token hợp lệ qua API Gateway -> Đảm bảo Gateway cho phép đi qua.
