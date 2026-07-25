import 'package:flutter_dotenv/flutter_dotenv.dart';

class AppConstants {
  static String get apiBaseUrl {
    return dotenv.get('API_BASE_URL');
  }

  // Roles
  static const int roleAdmin = 1;
  static const int roleDoctor = 2;
  static const int rolePatient = 3;
  static const int roleNurse = 4;

  // Booking statuses
  static const String bookingConfirmed = 'CONFIRMED';
  static const String bookingFinished = 'FINISHED';
  static const String bookingCanceled = 'CANCELED';
  static const String bookingNoShow = 'NO_SHOW';

  // Clinic types
  static const String clinicOnline = 'ONLINE';
  static const String clinicOffline = 'OFFLINE';

  // Shared Preferences keys
  static const String keyAccessToken = 'access_token';
  static const String keyRefreshToken = 'refresh_token';
  static const String keyUserId = 'user_id';
  static const String keyRoleId = 'role_id';
  static const String keyUserEmail = 'user_email';
  static const String keyUserName = 'user_name';
}
