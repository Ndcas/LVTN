-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Máy chủ: mysql
-- Thời gian đã tạo: Th7 10, 2026 lúc 10:06 AM
-- Phiên bản máy phục vụ: 9.7.1
-- Phiên bản PHP: 8.3.32

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Cơ sở dữ liệu: `schedule_service`
--

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `bookings`
--

CREATE TABLE `bookings` (
  `id` int NOT NULL,
  `patient_id` int NOT NULL,
  `time_slot_id` int NOT NULL,
  `status` enum('CONFIRMED','FINISHED','CANCELED','NO_SHOW') COLLATE utf8mb4_unicode_ci DEFAULT 'CONFIRMED',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `bookings`
--

INSERT INTO `bookings` (`id`, `patient_id`, `time_slot_id`, `status`, `created_at`, `updated_at`) VALUES
(1, 2, 1, 'CONFIRMED', '2026-06-15 08:05:28', '2026-06-15 08:05:28'),
(2, 2, 5, 'FINISHED', '2026-06-15 08:08:15', '2026-06-15 08:08:15'),
(3, 3, 6, 'FINISHED', '2026-06-15 08:08:15', '2026-06-15 08:08:15');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `doctor_leaves`
--

CREATE TABLE `doctor_leaves` (
  `id` int NOT NULL,
  `doctor_id` int NOT NULL,
  `leave_date` date NOT NULL,
  `reason` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('PENDING','APPROVED','REJECTED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING',
  `rejected_reason` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `doctor_leaves`
--

INSERT INTO `doctor_leaves` (`id`, `doctor_id`, `leave_date`, `reason`, `status`, `rejected_reason`, `created_at`, `updated_at`) VALUES
(1, 5, '2026-06-17', 'Đi hội thảo chuyên đề Mắt tại TP.HCM', 'APPROVED', NULL, '2026-06-15 08:05:28', '2026-06-15 08:05:28');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `doctor_weekly_templates`
--

CREATE TABLE `doctor_weekly_templates` (
  `id` int NOT NULL,
  `doctor_id` int NOT NULL,
  `day_of_week` tinyint NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `clinic_type` enum('ONLINE','OFFLINE') COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `doctor_weekly_templates`
--

INSERT INTO `doctor_weekly_templates` (`id`, `doctor_id`, `day_of_week`, `start_time`, `end_time`, `clinic_type`, `created_at`) VALUES
(1, 4, 3, '08:00:00', '08:30:00', 'OFFLINE', '2026-06-15 08:05:28'),
(2, 4, 3, '08:30:00', '09:00:00', 'OFFLINE', '2026-06-15 08:05:28'),
(3, 5, 3, '14:00:00', '14:30:00', 'OFFLINE', '2026-06-15 08:05:28'),
(4, 5, 3, '14:30:00', '15:00:00', 'ONLINE', '2026-06-15 08:05:28');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `global_holidays`
--

CREATE TABLE `global_holidays` (
  `id` int NOT NULL,
  `holiday_date` date NOT NULL,
  `name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `global_holidays`
--

INSERT INTO `global_holidays` (`id`, `holiday_date`, `name`, `description`, `created_at`) VALUES
(1, '2026-09-02', 'Lễ Quốc Khánh', 'Nghỉ lễ toàn quốc', '2026-06-15 08:05:28');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `opening_time`
--

CREATE TABLE `opening_time` (
  `id` int NOT NULL,
  `day_of_week` tinyint NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ;

--
-- Đang đổ dữ liệu cho bảng `opening_time`
--

INSERT INTO `opening_time` (`id`, `day_of_week`, `start_time`, `end_time`, `created_at`, `updated_at`) VALUES
(1, 1, '11:00:00', '12:30:00', '2026-07-10 10:06:25', '2026-07-10 10:06:25'),
(2, 1, '17:00:00', '19:30:00', '2026-07-10 10:06:25', '2026-07-10 10:06:25'),
(3, 2, '11:00:00', '12:30:00', '2026-07-10 10:06:25', '2026-07-10 10:06:25'),
(4, 2, '17:00:00', '19:30:00', '2026-07-10 10:06:25', '2026-07-10 10:06:25'),
(5, 3, '11:00:00', '12:30:00', '2026-07-10 10:06:25', '2026-07-10 10:06:25'),
(6, 3, '17:00:00', '19:30:00', '2026-07-10 10:06:25', '2026-07-10 10:06:25'),
(7, 4, '11:00:00', '12:30:00', '2026-07-10 10:06:25', '2026-07-10 10:06:25'),
(8, 4, '17:00:00', '19:30:00', '2026-07-10 10:06:25', '2026-07-10 10:06:25'),
(9, 5, '11:00:00', '12:30:00', '2026-07-10 10:06:25', '2026-07-10 10:06:25'),
(10, 5, '17:00:00', '19:30:00', '2026-07-10 10:06:25', '2026-07-10 10:06:25'),
(11, 6, '08:00:00', '12:00:00', '2026-07-10 10:06:25', '2026-07-10 10:06:25');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `schedule_change_requests`
--

CREATE TABLE `schedule_change_requests` (
  `id` int NOT NULL,
  `doctor_id` int NOT NULL,
  `status` enum('PENDING','APPROVED','REJECTED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING',
  `rejected_reason` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `schedule_change_request_details`
--

CREATE TABLE `schedule_change_request_details` (
  `id` int NOT NULL,
  `request_id` int NOT NULL,
  `day_of_week` tinyint NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `clinic_type` enum('ONLINE','OFFLINE') COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `time_slots`
--

CREATE TABLE `time_slots` (
  `id` int NOT NULL,
  `doctor_id` int NOT NULL,
  `clinic_date` date NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `clinic_type` enum('ONLINE','OFFLINE') COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('AVAILABLE','BOOKED') COLLATE utf8mb4_unicode_ci DEFAULT 'AVAILABLE',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `time_slots`
--

INSERT INTO `time_slots` (`id`, `doctor_id`, `clinic_date`, `start_time`, `end_time`, `clinic_type`, `status`, `created_at`, `updated_at`) VALUES
(1, 4, '2026-06-16', '08:00:00', '08:30:00', 'OFFLINE', 'BOOKED', '2026-06-15 08:05:28', '2026-06-15 08:05:28'),
(2, 4, '2026-06-16', '08:30:00', '09:00:00', 'OFFLINE', 'AVAILABLE', '2026-06-15 08:05:28', '2026-06-15 08:05:28'),
(3, 5, '2026-06-16', '14:00:00', '14:30:00', 'OFFLINE', 'AVAILABLE', '2026-06-15 08:05:28', '2026-06-15 08:05:28'),
(4, 5, '2026-06-16', '14:30:00', '15:00:00', 'ONLINE', 'AVAILABLE', '2026-06-15 08:05:28', '2026-06-15 08:05:28'),
(5, 4, '2026-06-14', '08:00:00', '08:30:00', 'OFFLINE', 'BOOKED', '2026-06-15 08:08:15', '2026-06-15 08:08:15'),
(6, 5, '2026-06-14', '14:00:00', '14:30:00', 'ONLINE', 'BOOKED', '2026-06-15 08:08:15', '2026-06-15 08:08:15');

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `bookings`
--
ALTER TABLE `bookings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `time_slot_id` (`time_slot_id`),
  ADD KEY `idx_patient_history` (`patient_id`,`created_at`);

--
-- Chỉ mục cho bảng `doctor_leaves`
--
ALTER TABLE `doctor_leaves`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_doctor_leave_date` (`doctor_id`,`leave_date`,`status`);

--
-- Chỉ mục cho bảng `doctor_weekly_templates`
--
ALTER TABLE `doctor_weekly_templates`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_doctor_day` (`doctor_id`,`day_of_week`);

--
-- Chỉ mục cho bảng `global_holidays`
--
ALTER TABLE `global_holidays`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `holiday_date` (`holiday_date`),
  ADD KEY `idx_holiday_date` (`holiday_date`);

--
-- Chỉ mục cho bảng `opening_time`
--
ALTER TABLE `opening_time`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `schedule_change_requests`
--
ALTER TABLE `schedule_change_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_admin_request_queue` (`status`,`created_at`);

--
-- Chỉ mục cho bảng `schedule_change_request_details`
--
ALTER TABLE `schedule_change_request_details`
  ADD PRIMARY KEY (`id`),
  ADD KEY `request_id` (`request_id`);

--
-- Chỉ mục cho bảng `time_slots`
--
ALTER TABLE `time_slots`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_doctor_available_slots` (`doctor_id`,`clinic_date`,`status`),
  ADD KEY `idx_cleanup_cron` (`clinic_date`,`status`);

--
-- AUTO_INCREMENT cho các bảng đã đổ
--

--
-- AUTO_INCREMENT cho bảng `bookings`
--
ALTER TABLE `bookings`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT cho bảng `doctor_leaves`
--
ALTER TABLE `doctor_leaves`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT cho bảng `doctor_weekly_templates`
--
ALTER TABLE `doctor_weekly_templates`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT cho bảng `global_holidays`
--
ALTER TABLE `global_holidays`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT cho bảng `opening_time`
--
ALTER TABLE `opening_time`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `schedule_change_requests`
--
ALTER TABLE `schedule_change_requests`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `schedule_change_request_details`
--
ALTER TABLE `schedule_change_request_details`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `time_slots`
--
ALTER TABLE `time_slots`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- Ràng buộc đối với các bảng kết xuất
--

--
-- Ràng buộc cho bảng `bookings`
--
ALTER TABLE `bookings`
  ADD CONSTRAINT `bookings_ibfk_1` FOREIGN KEY (`time_slot_id`) REFERENCES `time_slots` (`id`);

--
-- Ràng buộc cho bảng `schedule_change_request_details`
--
ALTER TABLE `schedule_change_request_details`
  ADD CONSTRAINT `schedule_change_request_details_ibfk_1` FOREIGN KEY (`request_id`) REFERENCES `schedule_change_requests` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
