import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../core/services/doctor_service.dart';
import '../../core/services/shared_service.dart';
import 'package:intl/intl.dart';

class DoctorBookingDetailScreen extends StatefulWidget {
  final int bookingId;

  const DoctorBookingDetailScreen({super.key, required this.bookingId});

  @override
  State<DoctorBookingDetailScreen> createState() =>
      _DoctorBookingDetailScreenState();
}

class _DoctorBookingDetailScreenState extends State<DoctorBookingDetailScreen> {
  final DoctorService _doctorService = DoctorService();
  final SharedService _sharedService = SharedService();
  bool _isLoading = true;
  dynamic _booking;

  @override
  void initState() {
    super.initState();

    _fetchBookingDetail();
  }

  Future<void> _fetchBookingDetail() async {
    try {
      final data = await _doctorService.getBookingById(widget.bookingId);

      if (mounted) {
        setState(() {
          _booking = data;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);

        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Lỗi tải chi tiết: $e')));
      }
    }
  }

  Future<void> _markNoShow() async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Xác nhận'),
        content: const Text('Bệnh nhân không đến khám?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Không'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Đúng vậy'),
          ),
        ],
      ),
    );

    if (confirm != true) {
      return;
    }

    try {
      await _doctorService.markNoShow(widget.bookingId);

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Đã cập nhật trạng thái vắng mặt')),
        );
        _fetchBookingDetail(); // Reload detail
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Lỗi cập nhật: $e')));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Chi tiết lịch hẹn')),
      body: _buildBody(),
    );
  }

  Widget _buildBody() {
    if (_isLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (_booking == null) {
      return const Center(child: Text('Không tìm thấy thông tin lịch hẹn'));
    }

    final timeSlot = _booking['timeSlot'];
    DateTime? startTime;

    if (timeSlot != null && timeSlot['startTime'] != null) {
      startTime = DateTime.tryParse(timeSlot['startTime']);
    }

    final patientName = _booking['patient']?['name'] ?? 'Bệnh nhân';
    final patientPhone = _booking['patient']?['phone'] ?? 'Chưa cập nhật';
    final status = _booking['status'] ?? '';
    final clinicType = _booking['clinicType'] ?? '';
    final patientId = _booking['patientId'];

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
                    'Thông tin khám',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
                  ),
                  const Divider(),
                  _buildDetailRow('Trạng thái', _getStatusText(status)),
                  _buildDetailRow(
                    'Hình thức',
                    clinicType == 'ONLINE'
                        ? 'Khám qua Video'
                        : 'Khám trực tiếp',
                  ),
                  _buildDetailRow(
                    'Thời gian',
                    startTime != null
                        ? DateFormat('HH:mm - dd/MM/yyyy').format(startTime)
                        : 'Chưa xếp lịch',
                  ),
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
                    'Thông tin bệnh nhân',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
                  ),
                  const Divider(),
                  _buildDetailRow('Bệnh nhân', patientName),
                  _buildDetailRow('Số điện thoại', patientPhone),
                  const SizedBox(height: 12),
                  OutlinedButton.icon(
                    onPressed: () {
                      if (patientId != null) {
                        context.push('/doctor/patient-records/$patientId');
                      }
                    },
                    icon: const Icon(Icons.history),
                    label: const Text('Xem lịch sử khám'),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 32),
          _buildActionButtons(status, clinicType),
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

  String _getStatusText(String status) {
    switch (status) {
      case 'CONFIRMED':
        return 'Chưa khám';
      case 'FINISHED':
        return 'Đã khám';
      case 'CANCELED':
        return 'Đã hủy';
      case 'NO_SHOW':
        return 'Bệnh nhân vắng mặt';
      default:
        return status;
    }
  }

  Widget _buildActionButtons(String status, String clinicType) {
    if (status == 'CONFIRMED') {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          if (clinicType == 'ONLINE')
            ElevatedButton.icon(
              onPressed: () async {
                try {
                  showDialog(
                    context: context,
                    barrierDismissible: false,
                    builder: (_) => const Center(child: CircularProgressIndicator()),
                  );
                  final callId = await _sharedService.getVideoCallToken(widget.bookingId);
                  if (mounted) {
                    Navigator.pop(context);
                    context.push('/call/$callId');
                  }
                } catch (e) {
                  if (mounted) {
                    Navigator.pop(context);
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text('Lỗi kết nối Video Call: $e')),
                    );
                  }
                }
              },
              icon: const Icon(Icons.videocam),
              label: const Text('Bắt đầu Video Call'),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.blue,
                foregroundColor: Colors.white,
              ),
            ),
          const SizedBox(height: 16),
          ElevatedButton.icon(
            onPressed: () {
              // Go to examine screen and wait for result
              context.push('/doctor/bookings/${widget.bookingId}/examine').then((
                _,
              ) {
                // Reload when returning from examine screen (maybe status changed)
                _fetchBookingDetail();
              });
            },
            icon: const Icon(Icons.edit_document),
            label: const Text('Khám bệnh'),
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.green,
              foregroundColor: Colors.white,
            ),
          ),
          const SizedBox(height: 16),
          OutlinedButton(
            onPressed: _markNoShow,
            style: OutlinedButton.styleFrom(foregroundColor: Colors.orange),
            child: const Text('Đánh dấu vắng mặt (No-Show)'),
          ),
        ],
      );
    }

    return const SizedBox.shrink();
  }
}
