import 'package:flutter/foundation.dart';

/// Notifier dùng để phát tín hiệu khi có thay đổi liên quan đến booking
/// (hủy lịch, đặt lịch mới, v.v.) để các màn hình khác tự làm mới.
class BookingNotifier extends ChangeNotifier {
  void notifyBookingChanged() {
    notifyListeners();
  }
}
