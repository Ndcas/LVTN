-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: 127.0.0.1
-- Thời gian đã tạo: Th6 20, 2026 lúc 09:49 AM
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
-- Cơ sở dữ liệu: `user_service`
--

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `degrees`
--

CREATE TABLE `degrees` (
  `id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `degrees`
--

INSERT INTO `degrees` (`id`, `name`, `description`, `created_at`) VALUES
(1, 'Bác sĩ Đa khoa', 'Bác sĩ y khoa tốt nghiệp hệ 6 năm', '2026-06-15 07:41:25'),
(2, 'Bác sĩ CK1', 'Bác sĩ Chuyên khoa cấp 1', '2026-06-15 07:41:25'),
(3, 'Thạc sĩ y khoa', 'Thạc sĩ y khoa học', '2026-06-15 07:41:25'),
(4, 'Tiến sĩ y khoa', 'Tiến sĩ chuyên ngành y học', '2026-06-15 07:41:25');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `doctor_metadata`
--

CREATE TABLE `doctor_metadata` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `specialty_id` int(11) NOT NULL,
  `degree_id` int(11) NOT NULL,
  `experience_years` int(11) NOT NULL DEFAULT 0,
  `biography` text DEFAULT NULL,
  `work_type` enum('ONLINE','OFFLINE','BOTH') NOT NULL DEFAULT 'BOTH',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `doctor_metadata`
--

INSERT INTO `doctor_metadata` (`id`, `user_id`, `specialty_id`, `degree_id`, `experience_years`, `biography`, `work_type`, `created_at`, `updated_at`) VALUES
(1, 4, 1, 3, 12, 'Hơn 10 năm kinh nghiệm điều trị viêm xoang, viêm mũi dị ứng và các bệnh lý Tai Mũi Họng nhi khoa.', 'BOTH', '2026-06-15 07:41:25', '2026-06-15 07:41:25'),
(2, 5, 2, 2, 8, 'Chuyên gia về nhãn nhi khoa, phẫu thuật tật khúc xạ và điều trị đục thủy tinh thể.', 'OFFLINE', '2026-06-15 07:41:25', '2026-06-15 07:41:25');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `roles`
--

CREATE TABLE `roles` (
  `id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `roles`
--

INSERT INTO `roles` (`id`, `name`, `description`, `created_at`) VALUES
(1, 'ADMIN', 'Quản trị viên hệ thống', '2026-06-15 07:41:25'),
(2, 'DOCTOR', 'Bác sĩ chuyên khoa', '2026-06-15 07:41:25'),
(3, 'PATIENT', 'Bệnh nhân', '2026-06-15 07:41:25'),
(4, 'NURSE', 'Điều dưỡng / Nhân viên thu ngân tại quầy', '2026-06-15 08:17:10');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `specialties`
--

CREATE TABLE `specialties` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `code` varchar(20) NOT NULL,
  `description` text DEFAULT NULL,
  `default_fee` decimal(10,2) NOT NULL DEFAULT 100000.00,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `specialties`
--

INSERT INTO `specialties` (`id`, `name`, `code`, `description`, `default_fee`, `created_at`) VALUES
(1, 'Khoa Tai Mũi Họng', 'TMH', 'Chuyên khám và điều trị các bệnh lý về Tai, Mũi, Họng', 150000.00, '2026-06-15 07:41:25'),
(2, 'Khoa Mắt', 'MAT', 'Chuyên khoa nhãn khoa, đo thị lực và điều trị bệnh về mắt', 120000.00, '2026-06-15 07:41:25');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `role_id` int(11) NOT NULL,
  `phone` varchar(15) NOT NULL,
  `password` varchar(255) NOT NULL,
  `email` varchar(100) NOT NULL,
  `is_active` enum('0','1') DEFAULT '1',
  `full_name` varchar(100) NOT NULL,
  `gender` enum('MALE','FEMALE','OTHER') NOT NULL,
  `dob` date DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `users`
--

INSERT INTO `users` (`id`, `role_id`, `phone`, `password`, `email`, `is_active`, `full_name`, `gender`, `dob`, `address`, `created_at`, `updated_at`) VALUES
(1, 1, '0901111222', '$2b$10$OYf.1TuAs4KkQPj2kBcZJunx.OWqx6q9pFzCo0hp217cVax5B3C1m', 'ndhung9911@gmail.com', '1', 'Nguyễn Quản Trị', 'MALE', '1990-05-15', '123 Đường Ba Tháng Hai, Cần Thơ', '2026-06-15 07:41:25', '2026-06-15 07:57:41'),
(2, 3, '0903456789', '$2b$10$OYf.1TuAs4KkQPj2kBcZJunx.OWqx6q9pFzCo0hp217cVax5B3C1m', 'hungb2203556@student.ctu.edu.vn', '1', 'Nguyễn Văn A', 'MALE', '1998-10-20', '456 Trần Hưng Đạo, Quận 1, TP.HCM', '2026-06-15 07:41:25', '2026-06-15 07:57:41'),
(3, 3, '0909876543', '$2b$10$OYf.1TuAs4KkQPj2kBcZJunx.OWqx6q9pFzCo0hp217cVax5B3C1m', 'lethib@gmail.com', '1', 'Lê Thị B', 'FEMALE', '2000-02-02', '789 Nguyễn Văn Linh, Ninh Kiều, Cần Thơ', '2026-06-15 07:41:25', '2026-06-15 07:57:41'),
(4, 2, '0912333444', '$2b$10$OYf.1TuAs4KkQPj2kBcZJunx.OWqx6q9pFzCo0hp217cVax5B3C1m', 'ndhung1919@gmail.com', '1', 'BS. Trần Mạnh Hùng', 'MALE', '1985-03-12', '12 Lý Tự Trọng, Cần Thơ', '2026-06-15 07:41:25', '2026-06-15 07:57:41'),
(5, 2, '0912555666', '$2b$10$OYf.1TuAs4KkQPj2kBcZJunx.OWqx6q9pFzCo0hp217cVax5B3C1m', 'dr.maiphuong@clinic.com', '1', 'BS. Phan Mai Phương', 'FEMALE', '1988-08-25', '88 Mậu Thân, Cần Thơ', '2026-06-15 07:41:25', '2026-06-15 07:57:41'),
(6, 4, '0988777666', '$2b$10$OYf.1TuAs4KkQPj2kBcZJunx.OWqx6q9pFzCo0hp217cVax5B3C1m', 'ndhung25032004@gmail.com', '1', 'Điều dưỡng Hoàng Ngọc Lan', 'FEMALE', '1995-07-20', 'Đường 30/4, Ninh Kiều, Cần Thơ', '2026-06-15 08:17:10', '2026-06-15 08:17:55');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `user_fcm_tokens`
--

CREATE TABLE `user_fcm_tokens` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `device_id` varchar(100) NOT NULL,
  `fcm_token` text NOT NULL,
  `device_name` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `degrees`
--
ALTER TABLE `degrees`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Chỉ mục cho bảng `doctor_metadata`
--
ALTER TABLE `doctor_metadata`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`),
  ADD KEY `degree_id` (`degree_id`),
  ADD KEY `idx_doctor_specialty` (`specialty_id`);

--
-- Chỉ mục cho bảng `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Chỉ mục cho bảng `specialties`
--
ALTER TABLE `specialties`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`),
  ADD UNIQUE KEY `code` (`code`);

--
-- Chỉ mục cho bảng `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `phone` (`phone`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `role_id` (`role_id`),
  ADD KEY `idx_auth_phone` (`phone`),
  ADD KEY `idx_auth_email` (`email`);

--
-- Chỉ mục cho bảng `user_fcm_tokens`
--
ALTER TABLE `user_fcm_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `device_id` (`device_id`),
  ADD KEY `user_id` (`user_id`);

--
-- AUTO_INCREMENT cho các bảng đã đổ
--

--
-- AUTO_INCREMENT cho bảng `degrees`
--
ALTER TABLE `degrees`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT cho bảng `doctor_metadata`
--
ALTER TABLE `doctor_metadata`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT cho bảng `roles`
--
ALTER TABLE `roles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT cho bảng `specialties`
--
ALTER TABLE `specialties`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT cho bảng `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT cho bảng `user_fcm_tokens`
--
ALTER TABLE `user_fcm_tokens`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Các ràng buộc cho các bảng đã đổ
--

--
-- Các ràng buộc cho bảng `doctor_metadata`
--
ALTER TABLE `doctor_metadata`
  ADD CONSTRAINT `doctor_metadata_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `doctor_metadata_ibfk_2` FOREIGN KEY (`specialty_id`) REFERENCES `specialties` (`id`),
  ADD CONSTRAINT `doctor_metadata_ibfk_3` FOREIGN KEY (`degree_id`) REFERENCES `degrees` (`id`);

--
-- Các ràng buộc cho bảng `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`);

--
-- Các ràng buộc cho bảng `user_fcm_tokens`
--
ALTER TABLE `user_fcm_tokens`
  ADD CONSTRAINT `user_fcm_tokens_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
