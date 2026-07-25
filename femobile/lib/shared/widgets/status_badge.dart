import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';

/// Widget hiển thị badge trạng thái booking
class StatusBadge extends StatelessWidget {
  final String status;

  const StatusBadge({super.key, required this.status});

  @override
  Widget build(BuildContext context) {
    final (label, bg, textColor) = _resolve(status);

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(
        label,
        style: TextStyle(
          color: textColor,
          fontSize: 12,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }

  (String, Color, Color) _resolve(String status) {
    switch (status) {
      case 'CONFIRMED':
        return (
          'Đã xác nhận',
          AppColors.statusConfirmedBg,
          AppColors.statusConfirmedText,
        );
      case 'FINISHED':
        return (
          'Đã khám',
          AppColors.statusFinishedBg,
          AppColors.statusFinishedText,
        );
      case 'CANCELED':
        return (
          'Đã hủy',
          AppColors.statusCanceledBg,
          AppColors.statusCanceledText,
        );
      case 'NO_SHOW':
        return (
          'Vắng mặt',
          AppColors.statusNoShowBg,
          AppColors.statusNoShowText,
        );
      case 'PENDING':
        return (
          'Chờ duyệt',
          AppColors.statusNoShowBg,
          AppColors.statusNoShowText,
        );
      case 'APPROVED':
        return (
          'Đã duyệt',
          AppColors.statusConfirmedBg,
          AppColors.statusConfirmedText,
        );
      case 'REJECTED':
        return (
          'Từ chối',
          AppColors.statusCanceledBg,
          AppColors.statusCanceledText,
        );
      case 'PAID':
        return (
          'Đã thanh toán',
          AppColors.statusConfirmedBg,
          AppColors.statusConfirmedText,
        );
      case 'UNPAID':
        return (
          'Chưa thanh toán',
          AppColors.statusNoShowBg,
          AppColors.statusNoShowText,
        );
      default:
        return (status, AppColors.backgroundCard, AppColors.textBody);
    }
  }
}
