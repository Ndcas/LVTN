import 'package:dio/dio.dart';
import 'package:femobile/core/services/api_service.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../core/services/doctor_service.dart';

class PatientRecordsScreen extends StatefulWidget {
  final int patientId;

  const PatientRecordsScreen({super.key, required this.patientId});

  @override
  State<PatientRecordsScreen> createState() => _PatientRecordsScreenState();
}

class _PatientRecordsScreenState extends State<PatientRecordsScreen> {
  final DoctorService _doctorService = DoctorService();
  bool _isLoading = true;
  List<dynamic> _records = [];
  int _page = 1;
  bool _hasMore = true;
  final ScrollController _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();

    _fetchRecords();

    _scrollController.addListener(_onScroll);
  }

  @override
  void dispose() {
    _scrollController.dispose();

    super.dispose();
  }

  void _onScroll() {
    if (_scrollController.position.pixels >=
        _scrollController.position.maxScrollExtent - 200) {
      if (!_isLoading && _hasMore) {
        _fetchRecords(loadMore: true);
      }
    }
  }

  Future<void> _fetchRecords({bool loadMore = false}) async {
    if (loadMore) {
      setState(() => _page++);
    } else {
      setState(() {
        _isLoading = true;
        _page = 1;
        _records.clear();
      });
    }

    try {
      final response = await _doctorService.getPatientRecords(
        patientId: widget.patientId,
        page: _page,
        limit: 10,
      );
      final List<dynamic> newData = response['data'] ?? [];
      final int total = response['total'] ?? 0;

      if (mounted) {
        setState(() {
          _records.addAll(newData);
          _hasMore = _records.length < total;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);

        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              'Lỗi tải lịch sử khám: ${e is DioException ? parseDioError(e) : e.toString()}',
            ),
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Lịch sử khám bệnh nhân')),
      body: _buildBody(),
    );
  }

  Widget _buildBody() {
    if (_isLoading && _records.isEmpty) {
      return const Center(child: CircularProgressIndicator());
    }

    if (_records.isEmpty) {
      return const Center(child: Text('Bệnh nhân chưa có lịch sử khám'));
    }

    return ListView.builder(
      controller: _scrollController,
      padding: const EdgeInsets.all(16.0),
      itemCount: _records.length + (_hasMore ? 1 : 0),
      itemBuilder: (context, index) {
        if (index == _records.length) {
          return const Padding(
            padding: EdgeInsets.symmetric(vertical: 16.0),
            child: Center(child: CircularProgressIndicator()),
          );
        }

        final record = _records[index];
        final visitDateStr = record['visitDate'] ?? record['createdAt'];
        DateTime? date;

        if (visitDateStr != null) {
          date = DateTime.tryParse(visitDateStr);
        }

        final diagnosis =
            record['diseaseName'] ??
            record['diagnoseDetail'] ??
            'Không có chẩn đoán';

        return Card(
          margin: const EdgeInsets.only(bottom: 16),
          child: ExpansionTile(
            title: Text(
              date != null
                  ? DateFormat('dd/MM/yyyy').format(date)
                  : 'Ngày khám',
              style: const TextStyle(fontWeight: FontWeight.bold),
            ),
            subtitle: Text('Chẩn đoán: $diagnosis'),
            children: [
              Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Triệu chứng: ${record['clinicalIndicators'] ?? 'Không rõ'}',
                    ),
                    const SizedBox(height: 8),
                    const Text(
                      'Đơn thuốc:',
                      style: TextStyle(fontWeight: FontWeight.bold),
                    ),
                    if (record['prescriptionDetails'] != null &&
                        record['prescriptionDetails'].isNotEmpty)
                      ...List.generate(record['prescriptionDetails'].length, (
                        i,
                      ) {
                        final p = record['prescriptionDetails'][i];
                        final medicineName = p['medicine'] ?? 'Thuốc không rõ';
                        return Padding(
                          padding: const EdgeInsets.only(bottom: 4.0),
                          child: Text(
                            '- $medicineName: ${p['quantity']} viên - ${p['dosage'] ?? 'Không có liều dùng'}',
                          ),
                        );
                      })
                    else
                      const Text('Không kê đơn'),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}
