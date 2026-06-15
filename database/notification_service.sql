-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: 127.0.0.1
-- Thời gian đã tạo: Th6 15, 2026 lúc 10:22 AM
-- Phiên bản máy phục vụ: 10.4.32-MariaDB
-- Phiên bản PHP: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Cơ sở dữ liệu: `notification_service`
--

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `notifications`
--

CREATE TABLE `notifications` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `title` varchar(150) NOT NULL,
  `content` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `notifications`
--

INSERT INTO `notifications` (`id`, `user_id`, `title`, `content`, `created_at`) VALUES
(1, 2, 'Đặt lịch thành công', 'Ca khám Tai Mũi Họng của bạn với BS Trần Mạnh Hùng vào lúc 08:00 ngày 16/06/2026 đã được xác nhận.', '2026-06-13 02:00:00'),
(2, 2, 'Thanh toán thành công', 'Cảm ơn bạn! Hóa đơn 239,000đ đã được thanh toán qua VNPAY. Bạn có thể đến quầy thuốc để nhận thuốc.', '2026-06-14 02:15:05'),
(3, 4, 'Có lịch hẹn mới', 'Bệnh nhân Nguyễn Văn A vừa đặt lịch khám tại phòng khám của bạn vào khung giờ 08:00 ngày 16/06/2026.', '2026-06-13 02:00:01'),
(4, 5, 'Đơn xin nghỉ phép đã duyệt', 'Ban quản lý đã duyệt đơn xin nghỉ phép của bạn vào chiều ngày 17/06/2026. Lịch khám trống đã được hệ thống tự động gỡ bỏ.', '2026-06-14 03:20:00'),
(5, 6, 'Bệnh nhân đang chờ thanh toán', 'Bệnh nhân Lê Thị B vừa hoàn tất ca khám Mắt. Vui lòng hỗ trợ thanh toán hóa đơn 175,000đ tại quầy thu ngân.', '2026-06-14 07:35:00');

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_timeline` (`user_id`,`created_at`);

--
-- AUTO_INCREMENT cho các bảng đã đổ
--

--
-- AUTO_INCREMENT cho bảng `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
