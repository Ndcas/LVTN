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
-- Cơ sở dữ liệu: `medical_record_service`
--

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `diseases`
--

CREATE TABLE `diseases` (
  `id` int(11) NOT NULL,
  `disease_code` varchar(20) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `diseases`
--

INSERT INTO `diseases` (`id`, `disease_code`, `name`, `description`, `created_at`) VALUES
(1, 'J00', 'Viêm mũi họng cấp [Cảm lạnh]', 'Bệnh lý viêm nhiễm cấp tính ở đường hô hấp trên.', '2026-06-15 08:10:39'),
(2, 'H10', 'Viêm kết mạc', 'Bệnh đau mắt đỏ, sưng nề và có mủ do vi khuẩn hoặc dị ứng.', '2026-06-15 08:10:39');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `medical_records`
--

CREATE TABLE `medical_records` (
  `id` int(11) NOT NULL,
  `booking_id` int(11) NOT NULL,
  `patient_id` int(11) NOT NULL,
  `doctor_id` int(11) NOT NULL,
  `visit_date` date NOT NULL,
  `clinical_indicators` text NOT NULL,
  `disease_id` int(11) DEFAULT NULL,
  `diagnose_detail` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `medical_records`
--

INSERT INTO `medical_records` (`id`, `booking_id`, `patient_id`, `doctor_id`, `visit_date`, `clinical_indicators`, `disease_id`, `diagnose_detail`, `created_at`) VALUES
(1, 2, 2, 4, '2026-06-14', 'Nhiệt độ: 38.5°C, Huyết áp: 120/80, Nhịp tim: 85', 1, 'Bệnh nhân bị viêm họng cấp kèm sốt. Dặn dò: Uống nhiều nước ấm, súc miệng nước muối, tránh ăn đồ lạnh.', '2026-06-15 08:10:39'),
(2, 3, 3, 5, '2026-06-14', 'Mắt phải đỏ, chảy nhiều nước mắt, cộm xốn. (Khám qua Video)', 2, 'Viêm kết mạc dị ứng do thời tiết. Dặn dò: Không dụi mắt, đeo kính râm khi ra đường, nhỏ thuốc đúng giờ.', '2026-06-15 08:10:39');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `medicines`
--

CREATE TABLE `medicines` (
  `id` int(11) NOT NULL,
  `name` varchar(150) NOT NULL,
  `unit` varchar(30) NOT NULL,
  `price_per_unit` decimal(10,2) NOT NULL,
  `is_active` enum('0','1') DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `medicines`
--

INSERT INTO `medicines` (`id`, `name`, `unit`, `price_per_unit`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'Paracetamol 500mg', 'Viên', 2000.00, '1', '2026-06-15 08:10:39', '2026-06-15 08:10:39'),
(2, 'Amoxicillin 500mg', 'Viên', 3500.00, '1', '2026-06-15 08:10:39', '2026-06-15 08:10:39'),
(3, 'Nước muối sinh lý NaCl 0.9%', 'Chai', 10000.00, '1', '2026-06-15 08:10:39', '2026-06-15 08:10:39'),
(4, 'Thuốc nhỏ mắt V.Rohto', 'Lọ', 55000.00, '1', '2026-06-15 08:10:39', '2026-06-15 08:10:39');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `prescriptions`
--

CREATE TABLE `prescriptions` (
  `id` int(11) NOT NULL,
  `record_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `prescriptions`
--

INSERT INTO `prescriptions` (`id`, `record_id`, `created_at`) VALUES
(1, 1, '2026-06-15 08:10:39'),
(2, 2, '2026-06-15 08:10:39');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `prescription_details`
--

CREATE TABLE `prescription_details` (
  `id` int(11) NOT NULL,
  `prescription_id` int(11) NOT NULL,
  `medicine_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL,
  `price_at_booking` decimal(10,2) NOT NULL,
  `dosage` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `prescription_details`
--

INSERT INTO `prescription_details` (`id`, `prescription_id`, `medicine_id`, `quantity`, `price_at_booking`, `dosage`) VALUES
(1, 1, 1, 10, 2000.00, 'Ngày uống 2 lần, mỗi lần 1 viên sau ăn. Chỉ uống khi sốt trên 38.5 độ.'),
(2, 1, 2, 14, 3500.00, 'Ngày uống 2 lần, mỗi lần 1 viên sau ăn. Uống đủ 7 ngày không bỏ dở.'),
(3, 1, 3, 2, 10000.00, 'Súc miệng ngày 3 lần: Sáng, trưa, tối.'),
(4, 2, 4, 1, 55000.00, 'Nhỏ mắt ngày 4 lần, mỗi lần 1-2 giọt vào bên mắt bị đỏ.');

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `diseases`
--
ALTER TABLE `diseases`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `disease_code` (`disease_code`),
  ADD KEY `idx_disease_search` (`disease_code`,`name`);

--
-- Chỉ mục cho bảng `medical_records`
--
ALTER TABLE `medical_records`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `booking_id` (`booking_id`),
  ADD KEY `disease_id` (`disease_id`),
  ADD KEY `idx_patient_history` (`patient_id`,`visit_date`);

--
-- Chỉ mục cho bảng `medicines`
--
ALTER TABLE `medicines`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`),
  ADD KEY `idx_medicine_search` (`name`,`is_active`);

--
-- Chỉ mục cho bảng `prescriptions`
--
ALTER TABLE `prescriptions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `record_id` (`record_id`);

--
-- Chỉ mục cho bảng `prescription_details`
--
ALTER TABLE `prescription_details`
  ADD PRIMARY KEY (`id`),
  ADD KEY `prescription_id` (`prescription_id`),
  ADD KEY `medicine_id` (`medicine_id`);

--
-- AUTO_INCREMENT cho các bảng đã đổ
--

--
-- AUTO_INCREMENT cho bảng `diseases`
--
ALTER TABLE `diseases`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT cho bảng `medical_records`
--
ALTER TABLE `medical_records`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT cho bảng `medicines`
--
ALTER TABLE `medicines`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT cho bảng `prescriptions`
--
ALTER TABLE `prescriptions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT cho bảng `prescription_details`
--
ALTER TABLE `prescription_details`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Các ràng buộc cho các bảng đã đổ
--

--
-- Các ràng buộc cho bảng `medical_records`
--
ALTER TABLE `medical_records`
  ADD CONSTRAINT `medical_records_ibfk_1` FOREIGN KEY (`disease_id`) REFERENCES `diseases` (`id`);

--
-- Các ràng buộc cho bảng `prescriptions`
--
ALTER TABLE `prescriptions`
  ADD CONSTRAINT `prescriptions_ibfk_1` FOREIGN KEY (`record_id`) REFERENCES `medical_records` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `prescription_details`
--
ALTER TABLE `prescription_details`
  ADD CONSTRAINT `prescription_details_ibfk_1` FOREIGN KEY (`prescription_id`) REFERENCES `prescriptions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `prescription_details_ibfk_2` FOREIGN KEY (`medicine_id`) REFERENCES `medicines` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
