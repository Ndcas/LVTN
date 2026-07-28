import 'api_service.dart';
import '../constants/api_endpoints.dart';

class PatientService {
  final ApiService _apiService = ApiService();

  // === Catalogs ===
  Future<List<dynamic>> getSpecialties() async {
    final response = await _apiService.dio.get(ApiEndpoints.specialties);

    return response.data['data'] as List<dynamic>;
  }

  // === Schedule ===
  Future<List<dynamic>> getOpeningTimes() async {
    final response = await _apiService.dio.get(ApiEndpoints.openingTime);

    return response.data['data'] as List<dynamic>;
  }

  Future<List<dynamic>> getAvailableTimeSlots({
    required String date,
    required int specialtyId,
    required String clinicType,
  }) async {
    final response = await _apiService.dio.get(
      ApiEndpoints.timeSlotsAvailable,
      queryParameters: {
        'date': date,
        'specialtyId': specialtyId,
        'clinicType': clinicType,
      },
    );

    return response.data['data'] as List<dynamic>;
  }

  // === Bookings ===
  Future<Map<String, dynamic>> createBooking(int timeSlotId) async {
    final response = await _apiService.dio.post(
      ApiEndpoints.bookingById(timeSlotId),
    );

    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> getBookings({
    int page = 1,
    int limit = 10,
    String? status,
  }) async {
    final query = <String, dynamic>{'page': page, 'limit': limit};

    if (status != null) {
      query['status'] = status;
    }

    final response = await _apiService.dio.get(
      ApiEndpoints.bookings,
      queryParameters: query,
    );

    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> getBookingById(int bookingId) async {
    final response = await _apiService.dio.get(
      ApiEndpoints.bookingById(bookingId),
    );

    return response.data['data'] as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> cancelBooking(int bookingId) async {
    final response = await _apiService.dio.patch(
      ApiEndpoints.cancelBooking(bookingId),
    );

    return response.data as Map<String, dynamic>;
  }

  // === Medical Records ===
  Future<Map<String, dynamic>> getMyRecords({
    int page = 1,
    int limit = 10,
  }) async {
    final response = await _apiService.dio.get(
      ApiEndpoints.myRecords,
      queryParameters: {'page': page, 'limit': limit},
    );

    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> getRecordByBooking(int bookingId) async {
    final response = await _apiService.dio.get(
      ApiEndpoints.recordByBooking(bookingId),
    );

    return response.data['data'] as Map<String, dynamic>;
  }
}
