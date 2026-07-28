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

    _scrollController.addListener(() {
      if (_scrollController.position.pixels ==
          _scrollController.position.maxScrollExtent) {
        if (!_isLoading && _hasMore) {
          _fetchRecords(loadMore: true);
        }
      }
    });
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
      _page++;
    } else {
      _page = 1;

      _records.clear();

      setState(() => _isLoading = true);
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

        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Lỗi tải hồ sơ: $e')));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Hồ sơ y tế')),
      body: _buildBody(),
    );
  }

  Widget _buildBody() {
    if (_isLoading && _records.isEmpty) {
      return const Center(child: CircularProgressIndicator());
    }

    if (_records.isEmpty) {
      return Center(
        child: Text(
          'Chưa có hồ sơ y tế nào',
          style: TextStyle(color: Colors.grey.shade600),
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: () => _fetchRecords(),
      child: ListView.builder(
        controller: _scrollController,
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
    );
  }

  Widget _buildRecordCard(dynamic record) {
    final booking = record['booking'];
    final diagnosis = record['diagnosis'] ?? 'Không rõ';
    DateTime? startTime;

    if (booking != null &&
        booking['timeSlot'] != null &&
        booking['timeSlot']['startTime'] != null) {
      startTime = DateTime.tryParse(booking['timeSlot']['startTime']);
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
          startTime != null
              ? DateFormat('dd/MM/yyyy').format(startTime)
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
          if (booking != null && booking['id'] != null) {
            context.go('/patient/records/${booking['id']}');
          }
        },
      ),
    );
  }
}
