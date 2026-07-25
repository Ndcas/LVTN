import 'dart:io';
import 'package:dio/dio.dart';
import 'package:firebase_app_installations/firebase_app_installations.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import '../constants/api_endpoints.dart';
import 'api_service.dart';
import 'storage_service.dart';

/// AuthService chứa toàn bộ logic call API liên quan đến xác thực.
class AuthService {
  final Dio _dio = ApiService().dio;

  /// Lấy OTP đăng ký
  Future<String?> getRegisterOtp(String email) async {
    final res = await _dio.post(
      ApiEndpoints.getRegisterOtp,
      data: {'email': email},
    );
    return res.data['message'] as String?;
  }

  /// Đăng ký tài khoản bệnh nhân
  Future<String?> register({
    required String email,
    required String password,
    required String phone,
    required String fullName,
    required String gender,
    required String otp,
    String? dob,
    String? address,
  }) async {
    final res = await _dio.post(
      ApiEndpoints.register,
      data: {
        'email': email,
        'password': password,
        'phone': phone,
        'fullName': fullName,
        'gender': gender,
        'otp': otp,
        'dob': dob,
        'address': address,
      },
    );

    return res.data['message'] as String?;
  }

  /// Đăng nhập — lấy FID làm deviceId, FCM token gửi để nhận push notification
  Future<Map<String, dynamic>> login({
    required String email,
    required String password,
  }) async {
    String? deviceId;
    String? fcmToken;

    try {
      deviceId = await FirebaseInstallations.instance.getId();

      fcmToken = await FirebaseMessaging.instance.getToken();
    } catch (_) {}

    final deviceName = Platform.isAndroid ? 'Android' : 'iOS';

    final res = await _dio.post(
      ApiEndpoints.login,
      data: {
        'email': email,
        'password': password,
        'deviceId': deviceId,
        'fcmToken': fcmToken,
        'deviceName': deviceName,
      },
    );

    return res.data as Map<String, dynamic>;
  }

  /// Đăng xuất
  Future<void> logout() async {
    final refreshToken = await StorageService.getRefreshToken();

    if (refreshToken != null) {
      try {
        await _dio.post(
          ApiEndpoints.logout,
          data: {'refreshToken': refreshToken},
        );
      } catch (_) {}
    }

    await StorageService.clear();
  }

  /// Lấy OTP quên mật khẩu
  Future<void> getForgotPasswordOtp(String email) async {
    await _dio.post(ApiEndpoints.getForgotOtp, data: {'email': email});
  }

  /// Đặt lại mật khẩu
  Future<String?> forgotPassword({
    required String email,
    required String otp,
    required String password,
  }) async {
    final res = await _dio.post(
      ApiEndpoints.forgotPassword,
      data: {'email': email, 'otp': otp, 'password': password},
    );

    return res.data['message'] as String?;
  }
}
