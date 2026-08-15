-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Máy chủ: mysql
-- Thời gian đã tạo: Th8 15, 2026 lúc 11:32 AM
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
-- Cơ sở dữ liệu: `medical_record_service`
--

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `diseases`
--

CREATE TABLE `diseases` (
  `id` int NOT NULL,
  `disease_code` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `diseases`
--

INSERT INTO `diseases` (`id`, `disease_code`, `name`, `description`, `created_at`) VALUES
(1, 'J00', 'Viêm mũi họng cấp [Cảm lạnh]', 'Bệnh lý viêm nhiễm cấp tính ở đường hô hấp trên.', '2026-06-15 08:10:39'),
(2, 'H10', 'Viêm kết mạc', 'Bệnh đau mắt đỏ, sưng nề và có mủ do vi khuẩn hoặc dị ứng.', '2026-06-15 08:10:39'),
(3, 'J01', 'Viêm xoang cấp tính', 'Viêm các xoang cạnh mũi cấp tính gây nghẹt mũi, chảy mũi đục, đau nhức vùng mặt trán.', '2026-06-15 08:10:39'),
(4, 'J02', 'Viêm họng cấp', 'Viêm cấp tính niêm mạc họng, cảm giác đau rát họng, nuốt đau, sốt nhẹ hoặc vừa.', '2026-06-15 08:10:39'),
(5, 'J03', 'Viêm amidan cấp', 'Viêm sưng tấy khối amidan khẩu cái, có chấm mủ hoặc màng giả, sốt cao, hơi thở hôi.', '2026-06-15 08:10:39'),
(6, 'J30', 'Viêm mũi dị ứng', 'Phản ứng quá mẫn niêm mạc mũi gây hắt hơi từng tràng, chảy nước mũi trong, ngứa mắt mũi.', '2026-06-15 08:10:39'),
(7, 'H00', 'Lẹo và chắp mắt', 'Nhiễm trùng cấp hoặc tắc nghẽn tuyến bã mi mắt gây khối sưng đau cục bộ ở mi mắt.', '2026-06-15 08:10:39'),
(8, 'H01', 'Viêm bờ mi', 'Viêm mạn tính mép bờ mi mắt gây ngứa rát, đỏ, bong vảy chân lông mi.', '2026-06-15 08:10:39'),
(9, 'H04', 'Khô mắt / Rối loạn hệ thống lệ', 'Giảm tiết hoặc tăng bốc hơi nước mắt dẫn đến cộm xốn, rát mắt, nhìn mờ không ổn định.', '2026-06-15 08:10:39'),
(10, 'H16', 'Viêm giác mạc', 'Viêm màng trong suốt phía trước nhãn cầu do vi khuẩn, virus, nấm hoặc dị vật, chấn thương.', '2026-06-15 08:10:39'),
(11, 'H52', 'Tật khúc xạ mắt', 'Tình trạng cận thị, viễn thị, loạn thị làm hình ảnh không hội tụ đúng trên võng mạc.', '2026-06-15 08:10:39'),
(12, 'H60', 'Viêm tai ngoài', 'Viêm da ống tai ngoài do nước hoặc chấn thương khi ngoáy tai, đau tai khi ấn nắp tai.', '2026-06-15 08:10:39'),
(13, 'H65', 'Viêm tai giữa thanh dịch cấp', 'Ứ đọng dịch thanh dịch không mủ trong hòm nhĩ gây giảm thính lực thoáng qua, ù tai.', '2026-06-15 08:10:39'),
(14, 'H66', 'Viêm tai giữa mủ cấp', 'Nhiễm khuẩn sinh mủ ở tai giữa, sốt cao, đau nhức tai dữ dội, màng nhĩ phồng hoặc thủng chảy mủ.', '2026-06-15 08:10:39'),
(15, 'K12', 'Viêm miệng áp-tơ [Nhiệt miệng]', 'Vết loét nhỏ nông ở niêm mạc môi, má, lưỡi gây đau rát khi ăn uống đồ cay nóng.', '2026-06-15 08:10:39'),
(16, 'R50', 'Sốt không rõ nguyên nhân', 'Nhiệt độ cơ thể tăng trên 38°C trong giai đoạn đầu chưa khu trú rõ ổ nhiễm trùng.', '2026-06-15 08:10:39'),
(17, 'R05', 'Ho khan / Ho có đờm', 'Phản xạ tống xuất dị vật hoặc chất tiết nhầy từ đường hô hấp trên và dưới.', '2026-06-15 08:10:39');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `medical_records`
--

CREATE TABLE `medical_records` (
  `id` int NOT NULL,
  `booking_id` int NOT NULL,
  `patient_id` int NOT NULL,
  `doctor_id` int NOT NULL,
  `visit_date` date NOT NULL,
  `clinical_indicators` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `disease_id` int DEFAULT NULL,
  `diagnose_detail` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `medical_records`
--

INSERT INTO `medical_records` (`id`, `booking_id`, `patient_id`, `doctor_id`, `visit_date`, `clinical_indicators`, `disease_id`, `diagnose_detail`, `created_at`) VALUES
(1, 1, 2, 4, '2026-06-15', 'Nhiệt độ: 38.5°C, Huyết áp: 120/80 mmHg, Nhịp tim: 82 l/p, Niêm mạc họng đỏ rực, có ít đờm trắng đục.', 1, 'Bệnh nhân bị viêm mũi họng cấp kèm sốt nhẹ. Dặn dò: Uống nhiều nước ấm, súc họng nước muối sinh lý 3 lần/ngày, tránh ăn đồ lạnh cay nóng, nghỉ ngơi hợp lý.', '2026-06-15 08:10:39');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `medicines`
--

CREATE TABLE `medicines` (
  `id` int NOT NULL,
  `name` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `unit` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `price_per_unit` decimal(10,2) NOT NULL,
  `is_active` enum('0','1') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `medicines`
--

INSERT INTO `medicines` (`id`, `name`, `unit`, `price_per_unit`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'Paracetamol 500mg', 'Viên', 2000.00, '1', '2026-06-15 08:10:39', '2026-06-15 08:10:39'),
(2, 'Amoxicillin 500mg', 'Viên', 3500.00, '1', '2026-06-15 08:10:39', '2026-06-15 08:10:39'),
(3, 'Nước muối sinh lý NaCl 0.9% 500ml', 'Chai', 10000.00, '1', '2026-06-15 08:10:39', '2026-06-15 08:10:39'),
(4, 'Thuốc nhỏ mắt V.Rohto 13ml', 'Lọ', 55000.00, '1', '2026-06-15 08:10:39', '2026-06-15 08:10:39'),
(5, 'Augmentin 1g (Amoxicillin/Clavulanate)', 'Viên', 18000.00, '1', '2026-06-15 08:10:39', '2026-06-15 08:10:39'),
(6, 'Klacid 500mg (Clarithromycin)', 'Viên', 22000.00, '1', '2026-06-15 08:10:39', '2026-06-15 08:10:39'),
(7, 'Cefixim 200mg', 'Viên', 8500.00, '1', '2026-06-15 08:10:39', '2026-06-15 08:10:39'),
(8, 'Panadol Extra (Đỏ)', 'Viên', 2500.00, '1', '2026-06-15 08:10:39', '2026-06-15 08:10:39'),
(9, 'Efferalgan 500mg (Viên sủi)', 'Viên', 4500.00, '1', '2026-06-15 08:10:39', '2026-06-15 08:10:39'),
(10, 'Ibuprofen 400mg', 'Viên', 3000.00, '1', '2026-06-15 08:10:39', '2026-06-15 08:10:39'),
(11, 'Alpha Chymotrypsine Choay', 'Viên', 3500.00, '1', '2026-06-15 08:10:39', '2026-06-15 08:10:39'),
(12, 'Telfast HD 180mg (Fexofenadine)', 'Viên', 9000.00, '1', '2026-06-15 08:10:39', '2026-06-15 08:10:39'),
(13, 'Cetirizin 10mg', 'Viên', 2000.00, '1', '2026-06-15 08:10:39', '2026-06-15 08:10:39'),
(14, 'Loratadin 10mg', 'Viên', 2500.00, '1', '2026-06-15 08:10:39', '2026-06-15 08:10:39'),
(15, 'Thuốc xịt mũi Otrivin 0.1% 10ml', 'Lọ', 65000.00, '1', '2026-06-15 08:10:39', '2026-06-15 08:10:39'),
(16, 'Thuốc nhỏ mắt Tobradex 5ml', 'Lọ', 58000.00, '1', '2026-06-15 08:10:39', '2026-06-15 08:10:39'),
(17, 'Thuốc nhỏ mắt Cravit 0.5% (Levofloxacin)', 'Lọ', 95000.00, '1', '2026-06-15 08:10:39', '2026-06-15 08:10:39'),
(18, 'Nước mắt nhân tạo Sanlein 0.1% 5ml', 'Lọ', 75000.00, '1', '2026-06-15 08:10:39', '2026-06-15 08:10:39'),
(19, 'Thuốc nhỏ mắt Systane Ultra 5ml', 'Lọ', 88000.00, '1', '2026-06-15 08:10:39', '2026-06-15 08:10:39'),
(20, 'Thuốc nhỏ tai Otipax 15ml', 'Lọ', 68000.00, '1', '2026-06-15 08:10:39', '2026-06-15 08:10:39'),
(21, 'Dung dịch xịt họng Betadine 50ml', 'Chai', 85000.00, '1', '2026-06-15 08:10:39', '2026-06-15 08:10:39'),
(22, 'Siro ho Prospan 100ml', 'Chai', 82000.00, '1', '2026-06-15 08:10:39', '2026-06-15 08:10:39'),
(23, 'Vitamin C 500mg', 'Viên', 1500.00, '1', '2026-06-15 08:10:39', '2026-06-15 08:10:39'),
(24, 'Kẽm Farzincol 10mg', 'Viên', 2500.00, '1', '2026-06-15 08:10:39', '2026-06-15 08:10:39');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `prescription_details`
--

CREATE TABLE `prescription_details` (
  `id` int NOT NULL,
  `record_id` int NOT NULL,
  `medicine_id` int NOT NULL,
  `quantity` int NOT NULL,
  `price_at_booking` decimal(10,2) NOT NULL,
  `dosage` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `prescription_details`
--

INSERT INTO `prescription_details` (`id`, `record_id`, `medicine_id`, `quantity`, `price_at_booking`, `dosage`) VALUES
(1, 1, 1, 10, 2000.00, 'Ngày uống 2 lần, mỗi lần 1 viên sau ăn. Chỉ uống khi sốt trên 38.5 độ.'),
(2, 1, 2, 14, 3500.00, 'Ngày uống 2 lần, mỗi lần 1 viên sau ăn sáng và tối. Uống đủ 7 ngày liên tục.'),
(3, 1, 3, 2, 10000.00, 'Súc họng miệng ngày 3 lần: Sáng, trưa, tối sau bữa ăn.');

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
-- Chỉ mục cho bảng `prescription_details`
--
ALTER TABLE `prescription_details`
  ADD PRIMARY KEY (`id`),
  ADD KEY `record_id` (`record_id`),
  ADD KEY `medicine_id` (`medicine_id`);

--
-- AUTO_INCREMENT cho các bảng đã đổ
--

--
-- AUTO_INCREMENT cho bảng `diseases`
--
ALTER TABLE `diseases`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT cho bảng `medical_records`
--
ALTER TABLE `medical_records`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT cho bảng `medicines`
--
ALTER TABLE `medicines`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT cho bảng `prescription_details`
--
ALTER TABLE `prescription_details`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Ràng buộc đối với các bảng kết xuất
--

--
-- Ràng buộc cho bảng `medical_records`
--
ALTER TABLE `medical_records`
  ADD CONSTRAINT `medical_records_ibfk_1` FOREIGN KEY (`disease_id`) REFERENCES `diseases` (`id`);

--
-- Ràng buộc cho bảng `prescription_details`
--
ALTER TABLE `prescription_details`
  ADD CONSTRAINT `prescription_details_ibfk_1` FOREIGN KEY (`record_id`) REFERENCES `medical_records` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `prescription_details_ibfk_2` FOREIGN KEY (`medicine_id`) REFERENCES `medicines` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
