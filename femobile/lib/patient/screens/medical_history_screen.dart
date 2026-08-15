import 'package:dio/dio.dart';
import 'package:femobile/core/services/api_service.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../core/services/patient_service.dart';
import 'package:intl/intl.dart';

class MedicalHistoryScreen extends StatefulWidget {
  const MedicalHistoryScreen({super.key});

  @override
  State<MedicalHistoryScreen> createState() => _MedicalHistoryScreenState();
}

class _MedicalHistoryScreenState extends State<MedicalHistoryScreen> {
  final PatientService _patientService = PatientService();
  bool _isLoading = true;
  List<dynamic> _records = [];
  bool _hasMore = true;
  int _page = 1;
  final ScrollController _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();

    _fetchRecords();

    _scrollController.addListener(_onScroll);
  }

  void _onScroll() {
    if (_scrollController.position.pixels >=
        _scrollController.position.maxScrollExtent - 200) {
      if (!_isLoading && _hasMore) {
        _fetchRecords(loadMore: true);
      }
    }
  }

  @override
  void dispose() {
    _scrollController.dispose();

    super.dispose();
  }

  Future<void> _fetchRecords({bool loadMore = false}) async {
    if (!mounted) {
      return;
    }

    if (loadMore) {
      setState(() => _page++);
    } else {
      _page = 1;
    }

    try {
      final response = await _patientService.getMyRecords(
        page: _page,
        limit: 10,
      );
      final newRecords = response['data'] ?? [];

      if (mounted) {
        setState(() {
          if (loadMore) {
            _records.addAll(newRecords);
          } else {
            _records = newRecords;
          }

          _hasMore = newRecords.length == 10;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);

        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              'Lỗi tải hồ sơ: ${e is DioException ? parseDioError(e) : e.toString()}',
            ),
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading && _records.isEmpty) {
      return Scaffold(
        appBar: AppBar(title: const Text('Hồ sơ y tế')),
        body: const Center(child: CircularProgressIndicator()),
      );
    }

    return Scaffold(
      appBar: AppBar(title: const Text('Hồ sơ y tế')),
      body: RefreshIndicator(
        onRefresh: () => _fetchRecords(),
        child: _records.isEmpty
            ? SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                child: SizedBox(
                  height: MediaQuery.of(context).size.height * 0.7,
                  child: Center(
                    child: Text(
                      'Chưa có hồ sơ y tế nào',
                      style: TextStyle(color: Colors.grey.shade600),
                    ),
                  ),
                ),
              )
            : ListView.builder(
                controller: _scrollController,
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.all(16.0),
                itemCount: _records.length + (_hasMore ? 1 : 0),
                itemBuilder: (context, index) {
                  if (index == _records.length) {
                    return const Center(
                      child: Padding(
                        padding: EdgeInsets.all(16.0),
                        child: CircularProgressIndicator(),
                      ),
                    );
                  }

                  final record = _records[index];
                  return _buildRecordCard(record);
                },
              ),
      ),
    );
  }

  Widget _buildRecordCard(dynamic record) {
    final bookingId = record['bookingId'];
    final diagnosis = record['diseaseName'] ?? 'Không rõ';
    DateTime? visitDate;

    if (record['visitDate'] != null) {
      visitDate = DateTime.tryParse(record['visitDate']);
    } else if (record['createdAt'] != null) {
      visitDate = DateTime.tryParse(record['createdAt']);
    }

    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      child: ListTile(
        contentPadding: const EdgeInsets.all(16),
        leading: CircleAvatar(
          backgroundColor: Colors.green.shade100,
          child: const Icon(Icons.assignment, color: Colors.green),
        ),
        title: Text(
          visitDate != null
              ? DateFormat('dd/MM/yyyy').format(visitDate)
              : 'Ngày khám',
          style: const TextStyle(fontWeight: FontWeight.bold),
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 4),
            Text(
              'Chẩn đoán: $diagnosis',
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ),
        trailing: const Icon(Icons.arrow_forward_ios, size: 16),
        onTap: () {
          if (bookingId != null) {
            context.go('/patient/records/$bookingId');
          }
        },
      ),
    );
  }
}
