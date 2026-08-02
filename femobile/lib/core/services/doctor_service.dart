import 'api_service.dart';
import '../constants/api_endpoints.dart';

class DoctorService {
  final ApiService _apiService = ApiService();

  // === Schedule ===
  Future<Map<String, dynamic>> getWeeklyTemplate() async {
    final response = await _apiService.dio.get(ApiEndpoints.templates);

    return response.data as Map<String, dynamic>;
  }

  // === Bookings ===
  Future<Map<String, dynamic>> getBookings({
    int page = 1,
    int limit = 10,
    String? status,
    String? date,
  }) async {
    final query = <String, dynamic>{'page': page, 'limit': limit};

    if (status != null) {
      query['status'] = status;
    }

    if (date != null) {
      query['date'] = date;
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

  Future<Map<String, dynamic>> markNoShow(int bookingId) async {
    final response = await _apiService.dio.patch(
      ApiEndpoints.noShowBooking(bookingId),
    );

    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> finishBooking(
    int bookingId,
    Map<String, dynamic> data,
  ) async {
    final response = await _apiService.dio.patch(
      ApiEndpoints.finishBooking(bookingId),
      data: data,
    );

    return response.data as Map<String, dynamic>;
  }

  // === Records ===
  Future<Map<String, dynamic>> getPatientRecords({
    required int patientId,
    int page = 1,
    int limit = 10,
  }) async {
    final response = await _apiService.dio.get(
      ApiEndpoints.recordsByPatient(patientId),
      queryParameters: {'page': page, 'limit': limit},
    );

    return response.data as Map<String, dynamic>;
  }

  // === Catalogs (Diseases & Medicines) ===
  Future<List<dynamic>> getAllDiseases() async {
    // Backend allows searching with keyword. If we don't provide it, we should get all.
    // Or we fetch with a high limit. Let's assume pagination exists, we fetch a large page.
    final response = await _apiService.dio.get(
      ApiEndpoints.diseases,
      queryParameters: {'page': 1, 'limit': 1000},
    );

    return response.data['data'] as List<dynamic>;
  }

  Future<List<dynamic>> getAllMedicines() async {
    final response = await _apiService.dio.get(
      ApiEndpoints.medicines,
      queryParameters: {'page': 1, 'limit': 1000},
    );

    return response.data['data'] as List<dynamic>;
  }

  // === Leaves ===
  Future<Map<String, dynamic>> getLeaves({
    int page = 1,
    int limit = 10,
    String? status,
  }) async {
    final query = <String, dynamic>{'page': page, 'limit': limit};

    if (status != null) {
      query['status'] = status;
    }

    final response = await _apiService.dio.get(
      ApiEndpoints.leaves,
      queryParameters: query,
    );

    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> createLeave(Map<String, dynamic> data) async {
    final response = await _apiService.dio.post(
      ApiEndpoints.leaves,
      data: data,
    );

    return response.data as Map<String, dynamic>;
  }

  // === Change Requests ===
  Future<Map<String, dynamic>> getChangeRequests({
    int page = 1,
    int limit = 10,
    String? status,
  }) async {
    final query = <String, dynamic>{'page': page, 'limit': limit};

    if (status != null) {
      query['status'] = status;
    }

    final response = await _apiService.dio.get(
      ApiEndpoints.changeRequests,
      queryParameters: query,
    );

    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> createChangeRequest(
    Map<String, dynamic> data,
  ) async {
    final response = await _apiService.dio.post(
      ApiEndpoints.changeRequests,
      data: data,
    );

    return response.data as Map<String, dynamic>;
  }

  // === Opening Times (For validations) ===
  Future<List<dynamic>> getOpeningTimes() async {
    final response = await _apiService.dio.get(ApiEndpoints.openingTime);

    return response.data['data'] as List<dynamic>;
  }
}
