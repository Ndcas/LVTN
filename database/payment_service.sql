-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Máy chủ: mysql
-- Thời gian đã tạo: Th7 20, 2026 lúc 10:14 AM
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
-- Cơ sở dữ liệu: `payment_service`
--

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `invoices`
--

CREATE TABLE `invoices` (
  `id` int NOT NULL,
  `booking_id` int NOT NULL,
  `patient_id` int NOT NULL,
  `examination_fee` decimal(10,2) NOT NULL,
  `medicine_fee` decimal(10,2) NOT NULL DEFAULT '0.00',
  `total_amount` decimal(10,2) NOT NULL,
  `payment_method` enum('CASH','VNPAY') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('UNPAID','PAID','CANCELED') COLLATE utf8mb4_unicode_ci DEFAULT 'UNPAID',
  `cashier_id` int DEFAULT NULL,
  `paid_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `invoices`
--

INSERT INTO `invoices` (`id`, `booking_id`, `patient_id`, `examination_fee`, `medicine_fee`, `total_amount`, `payment_method`, `status`, `cashier_id`, `paid_at`, `created_at`, `updated_at`) VALUES
(1, 2, 2, 150000.00, 89000.00, 239000.00, 'VNPAY', 'UNPAID', NULL, '2026-06-14 02:15:00', '2026-06-15 08:14:18', '2026-06-15 08:14:18'),
(2, 3, 3, 120000.00, 55000.00, 175000.00, NULL, '', NULL, NULL, '2026-06-15 08:14:18', '2026-06-15 08:14:18');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `payment_transactions`
--

CREATE TABLE `payment_transactions` (
  `id` int NOT NULL,
  `invoice_id` int NOT NULL,
  `txn_ref` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `transaction_no` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL,
  `status` enum('PENDING','SUCCESS','FAILED') COLLATE utf8mb4_unicode_ci DEFAULT 'PENDING',
  `payment_raw_log` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `payment_transactions`
--

INSERT INTO `payment_transactions` (`id`, `invoice_id`, `txn_ref`, `transaction_no`, `amount`, `status`, `payment_raw_log`, `created_at`, `updated_at`) VALUES
(1, 1, 'INV_1_20260614091000', '1406202612345678', 239000.00, 'PENDING', '{\"vnp_Amount\":\"23900000\",\"vnp_BankCode\":\"NCB\",\"vnp_CardType\":\"ATM\",\"vnp_OrderInfo\":\"Thanh toan vien phi\",\"vnp_PayDate\":\"20260614091500\",\"vnp_ResponseCode\":\"00\",\"vnp_TransactionNo\":\"1406202612345678\"}', '2026-06-14 02:10:00', '2026-06-15 08:14:18');

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `invoices`
--
ALTER TABLE `invoices`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `booking_id` (`booking_id`),
  ADD KEY `idx_patient_billing` (`patient_id`,`created_at`),
  ADD KEY `idx_cashier_queue` (`status`,`created_at`);

--
-- Chỉ mục cho bảng `payment_transactions`
--
ALTER TABLE `payment_transactions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `txn_ref` (`txn_ref`),
  ADD KEY `invoice_id` (`invoice_id`),
  ADD KEY `idx_vnpay_ipn` (`txn_ref`);

--
-- AUTO_INCREMENT cho các bảng đã đổ
--

--
-- AUTO_INCREMENT cho bảng `invoices`
--
ALTER TABLE `invoices`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT cho bảng `payment_transactions`
--
ALTER TABLE `payment_transactions`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Ràng buộc đối với các bảng kết xuất
--

--
-- Ràng buộc cho bảng `payment_transactions`
--
ALTER TABLE `payment_transactions`
  ADD CONSTRAINT `payment_transactions_ibfk_1` FOREIGN KEY (`invoice_id`) REFERENCES `invoices` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
