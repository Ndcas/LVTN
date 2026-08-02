import 'package:dio/dio.dart';
import 'package:femobile/core/services/api_service.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../core/services/doctor_service.dart';

class WorkScheduleScreen extends StatefulWidget {
  const WorkScheduleScreen({super.key});

  @override
  State<WorkScheduleScreen> createState() => _WorkScheduleScreenState();
}

class _WorkScheduleScreenState extends State<WorkScheduleScreen> {
  final DoctorService _doctorService = DoctorService();
  bool _isLoading = true;
  List<dynamic> _templates = [];

  @override
  void initState() {
    super.initState();
    _fetchSchedule();
  }

  Future<void> _fetchSchedule() async {
    try {
      final response = await _doctorService.getWeeklyTemplate();
      if (mounted) {
        setState(() {
          _templates = response['data'] ?? [];
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              'Lỗi tải lịch làm việc: ${e is DioException ? parseDioError(e) : e.toString()}',
            ),
          ),
        );
      }
    }
  }

  String _getDayName(String dayOfWeek) {
    switch (dayOfWeek.toString()) {
      case '0':
        return 'Chủ nhật';
      case '1':
        return 'Thứ 2';
      case '2':
        return 'Thứ 3';
      case '3':
        return 'Thứ 4';
      case '4':
        return 'Thứ 5';
      case '5':
        return 'Thứ 6';
      case '6':
        return 'Thứ 7';
      default:
        return 'Thứ ${dayOfWeek}';
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Lịch làm việc')),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _templates.isEmpty
          ? const Center(child: Text('Chưa có lịch làm việc'))
          : ListView.builder(
              padding: const EdgeInsets.only(
                left: 16,
                right: 16,
                top: 16,
                bottom: 80,
              ),
              itemCount: _templates.length,
              itemBuilder: (context, index) {
                final item = _templates[index];
                final day = _getDayName(item['dayOfWeek']?.toString() ?? '');
                final startTime = item['startTime'] ?? '';
                final endTime = item['endTime'] ?? '';
                final clinicType = item['clinicType'] ?? '';

                return Card(
                  margin: const EdgeInsets.only(bottom: 12),
                  child: ListTile(
                    leading: Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Theme.of(context).primaryColor.withOpacity(0.1),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(
                        Icons.calendar_today,
                        color: Colors.blue,
                      ),
                    ),
                    title: Text(
                      day,
                      style: const TextStyle(fontWeight: FontWeight.bold),
                    ),
                    subtitle: Text('$startTime - $endTime'),
                    trailing: Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 12,
                        vertical: 6,
                      ),
                      decoration: BoxDecoration(
                        color: clinicType.toUpperCase() == 'ONLINE'
                            ? Colors.green.withOpacity(0.1)
                            : Colors.orange.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(
                          color: clinicType.toUpperCase() == 'ONLINE'
                              ? Colors.green
                              : Colors.orange,
                        ),
                      ),
                      child: Text(
                        clinicType,
                        style: TextStyle(
                          color: clinicType.toUpperCase() == 'ONLINE'
                              ? Colors.green
                              : Colors.orange,
                          fontWeight: FontWeight.bold,
                          fontSize: 12,
                        ),
                      ),
                    ),
                  ),
                );
              },
            ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => context.push('/doctor/work-schedule/change-requests'),
        icon: const Icon(Icons.edit_calendar),
        label: const Text('Đổi lịch'),
      ),
    );
  }
}
