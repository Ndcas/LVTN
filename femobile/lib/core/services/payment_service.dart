import 'package:dio/dio.dart';
import '../constants/api_endpoints.dart';
import 'api_service.dart';

class PaymentService {
  final Dio _dio = ApiService().dio;

  Future<Map<String, dynamic>> getAllInvoices({
    int page = 1,
    int limit = 10,
    String? status,
  }) async {
    final res = await _dio.get(
      '/invoices',
      queryParameters: {
        'page': page,
        'limit': limit,
        if (status != null) 'status': status,
      },
    );

    return res.data;
  }

  Future<Map<String, dynamic>> getInvoice(int id) async {
    final res = await _dio.get(ApiEndpoints.invoiceById(id));

    return res.data;
  }

  Future<String> createPaymentUrl(int invoiceId) async {
    final res = await _dio.post(ApiEndpoints.createPaymentUrl(invoiceId));

    return res.data['paymentUrl'] as String;
  }
}
