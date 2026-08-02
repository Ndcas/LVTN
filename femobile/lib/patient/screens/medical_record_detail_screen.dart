import 'package:dio/dio.dart';
import 'package:femobile/core/services/api_service.dart';
import 'package:flutter/material.dart';
import '../../core/services/patient_service.dart';

class MedicalRecordDetailScreen extends StatefulWidget {
  final int bookingId;

  const MedicalRecordDetailScreen({super.key, required this.bookingId});

  @override
  State<MedicalRecordDetailScreen> createState() =>
      _MedicalRecordDetailScreenState();
}

class _MedicalRecordDetailScreenState extends State<MedicalRecordDetailScreen> {
  final PatientService _patientService = PatientService();
  bool _isLoading = true;
  dynamic _record;

  @override
  void initState() {
    super.initState();

    _fetchRecordDetail();
  }

  Future<void> _fetchRecordDetail() async {
    try {
      final data = await _patientService.getRecordByBooking(widget.bookingId);

      if (mounted) {
        setState(() {
          _record = data;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);

        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              'Lỗi tải bệnh án: ${e is DioException ? parseDioError(e) : e.toString()}',
            ),
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Chi tiết bệnh án')),
      body: _buildBody(),
    );
  }

  Widget _buildBody() {
    if (_isLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (_record == null) {
      return const Center(child: Text('Không tìm thấy thông tin bệnh án'));
    }

    final symptoms = _record['clinicalIndicators'] ?? 'Không có';
    final diagnosis =
        _record['diseaseName'] ?? _record['disease']?['name'] ?? 'Không rõ';
    final notes = _record['diagnoseDetail'] ?? '';
    final prescriptionDetails =
        _record['prescriptionDetails'] as List<dynamic>? ?? [];

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Thông tin khám bệnh',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
                  ),
                  const Divider(),
                  _buildDetailRow('Triệu chứng', symptoms),
                  _buildDetailRow('Chẩn đoán', diagnosis),
                  if (notes.isNotEmpty) _buildDetailRow('Ghi chú', notes),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Đơn thuốc',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
                  ),
                  const Divider(),
                  if (prescriptionDetails.isEmpty)
                    const Text('Không có đơn thuốc')
                  else
                    ...prescriptionDetails.map((detail) {
                      final medicineName = detail['medicine'] ?? 'Thuốc';
                      final quantity = detail['quantity'] ?? 0;
                      final dosage = detail['dosage'] ?? '';

                      return Padding(
                        padding: const EdgeInsets.only(bottom: 12.0),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              '$medicineName - Số lượng: $quantity',
                              style: const TextStyle(
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            if (dosage.isNotEmpty)
                              Text(
                                'Liều dùng: $dosage',
                                style: const TextStyle(color: Colors.grey),
                              ),
                          ],
                        ),
                      );
                    }),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDetailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 100,
            child: Text(label, style: const TextStyle(color: Colors.grey)),
          ),
          Expanded(
            child: Text(
              value,
              style: const TextStyle(fontWeight: FontWeight.w500),
            ),
          ),
        ],
      ),
    );
  }
}
