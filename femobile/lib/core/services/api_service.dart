import 'dart:async';
import 'package:dio/dio.dart';
import '../constants/app_constants.dart';
import '../constants/api_endpoints.dart';
import 'storage_service.dart';

/// Dio singleton được cấu hình sẵn:
/// - Base URL từ .env
/// - Request interceptor: gắn Authorization + correlation-id
/// - Response interceptor: tự động refresh token khi gặp 401
class ApiService {
  static final ApiService _instance = ApiService._internal();

  factory ApiService() {
    return _instance;
  }

  ApiService._internal();

  late final Dio _dio;
  bool _isRefreshing = false;
  final List<Completer<String?>> _failedQueue = [];

  void init() {
    _dio = Dio(
      BaseOptions(
        baseUrl: AppConstants.apiBaseUrl,
        connectTimeout: const Duration(seconds: 15),
        receiveTimeout: const Duration(seconds: 15),
        headers: {
          'Content-Type': 'application/json',
          'Client-Type': 'mobile',
          'ngrok-skip-browser-warning': 'true',
        },
      ),
    );

    _dio.interceptors.add(
      InterceptorsWrapper(onRequest: _onRequest, onError: _onError),
    );
  }

  Dio get dio {
    return _dio;
  }

  Future<void> _onRequest(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) async {
    final token = await StorageService.getAccessToken();
    const unprotectedEndpoints = [
      ApiEndpoints.login,
      ApiEndpoints.register,
      ApiEndpoints.refresh,
    ];

    if (token != null && !unprotectedEndpoints.contains(options.path)) {
      options.headers['Authorization'] = 'Bearer $token';
    }

    handler.next(options);
  }

  Future<void> _onError(
    DioException err,
    ErrorInterceptorHandler handler,
  ) async {
    // 1. Chỉ xử lý khi mã lỗi là 401
    if (err.response?.statusCode != 401) {
      handler.next(err);

      return;
    }

    // 2. Nếu chính request refresh bị 401 (hoặc lỗi khác) thì không xử lý nữa (tránh loop)
    if (err.requestOptions.path == ApiEndpoints.refresh) {
      await StorageService.clear();

      handler.next(err);

      return;
    }

    // 3. Nếu ĐANG refresh token -> Đưa các request 401 khác vào hàng đợi (Queue)
    if (_isRefreshing) {
      final completer = Completer<String?>();

      _failedQueue.add(completer);

      try {
        // Đứng chờ tới khi có token mới (hoặc báo lỗi)
        final newAccessToken = await completer.future;

        if (newAccessToken != null) {
          // Gắn token mới và retry
          err.requestOptions.headers['Authorization'] =
              'Bearer $newAccessToken';

          final response = await _dio.fetch(err.requestOptions);

          handler.resolve(response);
        } else {
          // Refresh thất bại -> tiếp tục đẩy lỗi đi
          handler.next(err);
        }
      } catch (_) {
        handler.next(err);
      }

      return;
    }

    // 4. Bắt đầu quá trình refresh token (khóa cờ lại)
    _isRefreshing = true;

    final refreshToken = await StorageService.getRefreshToken();

    if (refreshToken == null) {
      _isRefreshing = false;

      handler.next(err);

      return;
    }

    try {
      final response = await _dio.post(
        ApiEndpoints.refresh,
        data: {'refreshToken': refreshToken},
      );
      final newAccess = response.data['accessToken'] as String;
      final newRefresh = response.data['refreshToken'] as String;

      await StorageService.saveTokens(
        accessToken: newAccess,
        refreshToken: newRefresh,
      );

      // Giải cứu các request đang nằm trong hàng đợi
      for (final completer in _failedQueue) {
        completer.complete(newAccess);
      }

      _failedQueue.clear();

      // Retry request gốc đã gọi hàm refresh này
      err.requestOptions.headers['Authorization'] = 'Bearer $newAccess';

      final retryResponse = await _dio.fetch(err.requestOptions);

      handler.resolve(retryResponse);
    } catch (_) {
      await StorageService.clear();

      // Báo cho toàn bộ hàng đợi biết là refresh thất bại
      for (final completer in _failedQueue) {
        completer.complete(null);
      }

      _failedQueue.clear();

      handler.next(err);
    } finally {
      _isRefreshing = false;
    }
  }
}

/// Helper nhỏ để parse lỗi từ response Dio
String parseDioError(DioException e) {
  try {
    final data = e.response?.data;

    if (data is Map) {
      return (data['message'] as String?) ?? 'Đã có lỗi xảy ra';
    }
  } catch (_) {}

  if (e.type == DioExceptionType.connectionTimeout ||
      e.type == DioExceptionType.receiveTimeout) {
    return 'Kết nối bị timeout, vui lòng thử lại';
  }

  if (e.type == DioExceptionType.connectionError) {
    return 'Không thể kết nối đến máy chủ';
  }

  return e.message ?? 'Đã có lỗi xảy ra';
}
