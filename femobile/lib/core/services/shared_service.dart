import 'package:dio/dio.dart';
import '../constants/api_endpoints.dart';
import 'api_service.dart';

class SharedService {
  final Dio _dio = ApiService().dio;

  Future<Map<String, dynamic>> getNotifications({
    int page = 1,
    int limit = 20,
  }) async {
    final res = await _dio.get(
      ApiEndpoints.notifications,
      queryParameters: {'page': page, 'limit': limit},
    );

    return res.data;
  }

  Future<Map<String, dynamic>> getMyProfile() async {
    final res = await _dio.get(ApiEndpoints.myProfile);

    return res.data['data'] as Map<String, dynamic>;
  }

  Future<void> sendFeedback(String title, String content) async {
    await _dio.post(
      ApiEndpoints.feedbacks,
      data: {'title': title, 'content': content},
    );
  }

  Future<String> getVideoCallToken(int bookingId) async {
    final res = await _dio.get(ApiEndpoints.videoCallToken(bookingId));

    // Dựa vào backend trả về { callId: '...' } hoặc chuỗi text
    if (res.data is Map) {
      return res.data['callId'] as String;
    }

    return res.data as String;
  }
}
