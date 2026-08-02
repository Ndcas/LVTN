import 'package:dio/dio.dart';
import 'package:femobile/core/services/api_service.dart';
import 'package:flutter/material.dart';
import 'dart:math' as math;
import 'package:intl/intl.dart';
import '../../core/services/doctor_service.dart';

class ChangeRequestScreen extends StatefulWidget {
  const ChangeRequestScreen({super.key});

  @override
  State<ChangeRequestScreen> createState() => _ChangeRequestScreenState();
}

class _ChangeRequestScreenState extends State<ChangeRequestScreen> {
  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 2,
      child: Scaffold(
        appBar: AppBar(
          title: const Text('Yêu cầu đổi lịch'),
          bottom: const TabBar(
            tabs: [
              Tab(text: 'Danh sách'),
              Tab(text: 'Tạo yêu cầu'),
            ],
          ),
        ),
        body: const TabBarView(
          children: [_ChangeRequestListTab(), _CreateChangeRequestTab()],
        ),
      ),
    );
  }
}

class _ChangeRequestListTab extends StatefulWidget {
  const _ChangeRequestListTab();

  @override
  State<_ChangeRequestListTab> createState() => _ChangeRequestListTabState();
}

class _ChangeRequestListTabState extends State<_ChangeRequestListTab> {
  final DoctorService _doctorService = DoctorService();
  bool _isLoading = true;
  List<dynamic> _requests = [];
  int _page = 1;
  bool _hasMore = true;
  final ScrollController _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();

    _fetchRequests();

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
        _fetchRequests(loadMore: true);
      }
    }
  }

  Future<void> _fetchRequests({bool loadMore = false}) async {
    if (loadMore) {
      setState(() => _page++);
    } else {
      setState(() {
        _isLoading = true;
        _page = 1;
        _requests.clear();
      });
    }

    try {
      final response = await _doctorService.getChangeRequests(
        page: _page,
        limit: 10,
      );
      final List<dynamic> newData = response['data'] ?? [];
      final int total = response['total'] ?? 0;

      if (mounted) {
        setState(() {
          _requests.addAll(newData);
          _hasMore = _requests.length < total;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);

        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              'Lỗi tải danh sách yêu cầu: ${e is DioException ? parseDioError(e) : e.toString()}',
            ),
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading && _requests.isEmpty) {
      return const Center(child: CircularProgressIndicator());
    }

    if (_requests.isEmpty) {
      return RefreshIndicator(
        onRefresh: () => _fetchRequests(),
        child: const SingleChildScrollView(
          physics: AlwaysScrollableScrollPhysics(),
          child: Center(
            child: Padding(
              padding: EdgeInsets.all(32.0),
              child: Text('Chưa có yêu cầu đổi lịch nào'),
            ),
          ),
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: () => _fetchRequests(),
      child: ListView.builder(
        controller: _scrollController,
        padding: const EdgeInsets.all(16),
        itemCount: _requests.length + (_hasMore ? 1 : 0),
        itemBuilder: (context, index) {
          if (index == _requests.length) {
            return const Center(child: CircularProgressIndicator());
          }

          final request = _requests[index];
          final status = request['status'] ?? '';
          final createdAt = DateTime.tryParse(request['createdAt'] ?? '');
          final rejectedReason = request['rejectedReason'];
          Color statusColor;
          String statusText;

          switch (status) {
            case 'PENDING':
              statusColor = Colors.orange;
              statusText = 'Chờ duyệt';
              break;
            case 'APPROVED':
              statusColor = Colors.green;
              statusText = 'Đã duyệt';
              break;
            case 'REJECTED':
              statusColor = Colors.red;
              statusText = 'Từ chối';
              break;
            default:
              statusColor = Colors.grey;
              statusText = status;
          }

          return Card(
            margin: const EdgeInsets.only(bottom: 16),
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Yêu cầu ngày ${createdAt != null ? DateFormat('dd/MM/yyyy').format(createdAt) : ''}',
                        style: const TextStyle(fontWeight: FontWeight.bold),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 4,
                        ),
                        decoration: BoxDecoration(
                          color: statusColor.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(4),
                          border: Border.all(color: statusColor),
                        ),
                        child: Text(
                          statusText,
                          style: TextStyle(
                            color: statusColor,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ],
                  ),
                  if (status == 'REJECTED' && rejectedReason != null) ...[
                    const SizedBox(height: 8),
                    Text(
                      'Lý do từ chối: $rejectedReason',
                      style: const TextStyle(color: Colors.red),
                    ),
                  ],
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}

class _CreateChangeRequestTab extends StatefulWidget {
  const _CreateChangeRequestTab();

  @override
  State<_CreateChangeRequestTab> createState() =>
      _CreateChangeRequestTabState();
}

class _CreateChangeRequestTabState extends State<_CreateChangeRequestTab> {
  final DoctorService _doctorService = DoctorService();
  bool _isLoading = true;
  bool _isSubmitting = false;
  List<dynamic> _openingTimes = [];
  final List<Map<String, dynamic>> _details = [];
  final List<String> _daysOfWeek = [
    'Chủ nhật',
    'Thứ 2',
    'Thứ 3',
    'Thứ 4',
    'Thứ 5',
    'Thứ 6',
    'Thứ 7',
  ];

  @override
  void initState() {
    super.initState();
    _fetchOpeningTimes();
  }

  Future<void> _fetchOpeningTimes() async {
    try {
      final times = await _doctorService.getOpeningTimes();

      if (mounted) {
        setState(() {
          _openingTimes = times;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);

        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              'Lỗi tải giờ mở cửa: ${e is DioException ? parseDioError(e) : e.toString()}',
            ),
          ),
        );
      }
    }
  }

  int _timeToSeconds(String time) {
    // Expected format HH:mm or HH:mm:ss
    final parts = time.split(':').map((e) => int.tryParse(e) ?? 0).toList();
    final h = parts.isNotEmpty ? parts[0] : 0;
    final m = parts.length > 1 ? parts[1] : 0;
    final s = parts.length > 2 ? parts[2] : 0;

    return h * 3600 + m * 60 + s;
  }

  String? _validateDetails() {
    if (_details.isEmpty) {
      return 'Vui lòng thêm ít nhất 1 ca khám';
    }

    for (int i = 0; i < _details.length; i++) {
      final d = _details[i];

      if (d['startTime'] == null || d['endTime'] == null) {
        return 'Vui lòng chọn thời gian đầy đủ cho ca khám thứ ${i + 1}';
      }

      final startSec = _timeToSeconds(d['startTime']);
      final endSec = _timeToSeconds(d['endTime']);

      if (startSec >= endSec) {
        return 'Thời gian bắt đầu phải trước thời gian kết thúc ở ca thứ ${i + 1}';
      }

      // Check overlap within requested slots
      for (int j = 0; j < i; j++) {
        final other = _details[j];

        if (other['dayOfWeek'] == d['dayOfWeek']) {
          final otherStartSec = _timeToSeconds(other['startTime']);
          final otherEndSec = _timeToSeconds(other['endTime']);

          if (math.max(startSec, otherStartSec) <
              math.min(endSec, otherEndSec)) {
            return 'Ca thứ ${i + 1} và ${j + 1} bị trùng lặp thời gian trong cùng một ngày';
          }
        }
      }

      // Offline check
      if (d['clinicType'] == 'OFFLINE') {
        final dayOfWeek = d['dayOfWeek'];
        final clinicHoursForDay = _openingTimes
            .where((o) => o['dayOfWeek'] == dayOfWeek)
            .toList();

        if (clinicHoursForDay.isEmpty) {
          return 'Phòng khám không hoạt động vào ${_daysOfWeek[dayOfWeek]} (Ca thứ ${i + 1})';
        }

        bool isValidOffline = false;

        for (final clinicHour in clinicHoursForDay) {
          final clinicStartSec = _timeToSeconds(clinicHour['startTime']);
          final clinicEndSec = _timeToSeconds(clinicHour['endTime']);

          if (startSec >= clinicStartSec && endSec <= clinicEndSec) {
            isValidOffline = true;

            break;
          }
        }

        if (!isValidOffline) {
          return 'Ca thứ ${i + 1} (OFFLINE) nằm ngoài giờ làm việc của phòng khám';
        }
      }
    }

    return null;
  }

  Future<void> _submit() async {
    final error = _validateDetails();

    if (error != null) {
      showDialog(
        context: context,
        builder: (context) => AlertDialog(
          title: const Text('Lỗi hợp lệ'),
          content: Text(error),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Đã hiểu'),
            ),
          ],
        ),
      );

      return;
    }

    setState(() => _isSubmitting = true);

    try {
      final payload = {
        'details': _details
            .map(
              (d) => {
                'dayOfWeek': d['dayOfWeek'],
                'startTime': '${d['startTime']}:00',
                'endTime': '${d['endTime']}:00',
                'clinicType': d['clinicType'],
              },
            )
            .toList(),
      };

      await _doctorService.createChangeRequest(payload);

      if (mounted) {
        setState(() {
          _isSubmitting = false;
          _details.clear();
        });

        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Gửi yêu cầu đổi lịch thành công!')),
        );
        // User has to switch back to list tab to see it
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isSubmitting = false);

        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              'Lỗi gửi yêu cầu: ${e is DioException ? parseDioError(e) : e.toString()}',
            ),
          ),
        );
      }
    }
  }

  void _addDetailRow() {
    setState(() {
      _details.add({
        'dayOfWeek': 1, // Default Monday
        'startTime': null,
        'endTime': null,
        'clinicType': 'OFFLINE',
      });
    });
  }

  void _removeDetailRow(int index) {
    setState(() {
      _details.removeAt(index);
    });
  }

  Future<void> _selectTime(int index, bool isStart) async {
    final TimeOfDay? picked = await showTimePicker(
      context: context,
      initialTime: const TimeOfDay(hour: 8, minute: 0),
    );

    if (picked != null) {
      final formatted =
          '${picked.hour.toString().padLeft(2, '0')}:${picked.minute.toString().padLeft(2, '0')}';

      setState(() {
        if (isStart) {
          _details[index]['startTime'] = formatted;
        } else {
          _details[index]['endTime'] = formatted;
        }
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Card(
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Giờ hoạt động phòng khám (Tham khảo)',
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                ),
                const SizedBox(height: 8),
                if (_openingTimes.isEmpty)
                  const Text('Không có dữ liệu giờ mở cửa')
                else
                  ..._daysOfWeek.asMap().entries.map((entry) {
                    final dayIndex = entry.key;
                    final times = _openingTimes
                        .where((o) => o['dayOfWeek'] == dayIndex)
                        .toList();
                    if (times.isEmpty) return const SizedBox.shrink();

                    final timeStrs = times
                        .map(
                          (t) =>
                              '${t['startTime'].substring(0, 5)} - ${t['endTime'].substring(0, 5)}',
                        )
                        .join(', ');
                    return Text('• ${entry.value}: $timeStrs');
                  }).toList(),
              ],
            ),
          ),
        ),
        const SizedBox(height: 16),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Text(
              'Các ca làm việc',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            TextButton.icon(
              onPressed: _addDetailRow,
              icon: const Icon(Icons.add),
              label: const Text('Thêm ca'),
            ),
          ],
        ),
        const Divider(),
        ..._details.asMap().entries.map((entry) {
          final index = entry.key;
          final detail = entry.value;

          return Card(
            margin: const EdgeInsets.only(bottom: 16),
            child: Padding(
              padding: const EdgeInsets.all(12.0),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Ca thứ ${index + 1}',
                        style: const TextStyle(fontWeight: FontWeight.bold),
                      ),
                      IconButton(
                        icon: const Icon(Icons.delete, color: Colors.red),
                        onPressed: () => _removeDetailRow(index),
                      ),
                    ],
                  ),
                  Row(
                    children: [
                      Expanded(
                        child: DropdownButtonFormField<int>(
                          decoration: const InputDecoration(labelText: 'Thứ'),
                          value: detail['dayOfWeek'],
                          items: _daysOfWeek.asMap().entries.map((day) {
                            return DropdownMenuItem(
                              value: day.key,
                              child: Text(day.value),
                            );
                          }).toList(),
                          onChanged: (val) {
                            if (val != null) {
                              setState(
                                () => _details[index]['dayOfWeek'] = val,
                              );
                            }
                          },
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: DropdownButtonFormField<String>(
                          decoration: const InputDecoration(
                            labelText: 'Hình thức',
                          ),
                          value: detail['clinicType'],
                          items: const [
                            DropdownMenuItem(
                              value: 'OFFLINE',
                              child: Text('Tại PK'),
                            ),
                            DropdownMenuItem(
                              value: 'ONLINE',
                              child: Text('Online'),
                            ),
                          ],
                          onChanged: (val) {
                            if (val != null) {
                              setState(
                                () => _details[index]['clinicType'] = val,
                              );
                            }
                          },
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton(
                          onPressed: () => _selectTime(index, true),
                          child: Text(detail['startTime'] ?? 'Giờ BĐ'),
                        ),
                      ),
                      const Padding(
                        padding: EdgeInsets.symmetric(horizontal: 8.0),
                        child: Text('-'),
                      ),
                      Expanded(
                        child: OutlinedButton(
                          onPressed: () => _selectTime(index, false),
                          child: Text(detail['endTime'] ?? 'Giờ KT'),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          );
        }).toList(),
        const SizedBox(height: 32),
        ElevatedButton(
          onPressed: _isSubmitting || _details.isEmpty ? null : _submit,
          style: ElevatedButton.styleFrom(
            padding: const EdgeInsets.symmetric(vertical: 16),
            backgroundColor: Colors.blue,
            foregroundColor: Colors.white,
          ),
          child: _isSubmitting
              ? const CircularProgressIndicator(color: Colors.white)
              : const Text('Gửi yêu cầu', style: TextStyle(fontSize: 16)),
        ),
      ],
    );
  }
}
