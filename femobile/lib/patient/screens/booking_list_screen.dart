import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../core/services/patient_service.dart';
import 'package:intl/intl.dart';

class BookingListScreen extends StatelessWidget {
  const BookingListScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 3,
      child: Scaffold(
        appBar: AppBar(
          title: const Text('Lịch hẹn của tôi'),
          bottom: const TabBar(
            tabs: [
              Tab(text: 'Sắp tới'),
              Tab(text: 'Đã khám'),
              Tab(text: 'Đã hủy'),
            ],
          ),
        ),
        body: const TabBarView(
          children: [
            _BookingListView(status: 'CONFIRMED'),
            _BookingListView(status: 'FINISHED'),
            _BookingListView(status: 'CANCELED'),
          ],
        ),
      ),
    );
  }
}

class _BookingListView extends StatefulWidget {
  final String status;

  const _BookingListView({required this.status});

  @override
  State<_BookingListView> createState() => _BookingListViewState();
}

class _BookingListViewState extends State<_BookingListView> {
  final PatientService _patientService = PatientService();
  bool _isLoading = true;
  List<dynamic> _bookings = [];
  bool _hasMore = true;
  int _page = 1;

  final ScrollController _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    _fetchBookings();

    _scrollController.addListener(() {
      if (_scrollController.position.pixels ==
          _scrollController.position.maxScrollExtent) {
        if (!_isLoading && _hasMore) {
          _fetchBookings(loadMore: true);
        }
      }
    });
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  Future<void> _fetchBookings({bool loadMore = false}) async {
    if (!mounted) return;
    if (loadMore) {
      _page++;
    } else {
      _page = 1;
      _bookings.clear();
      setState(() => _isLoading = true);
    }

    try {
      final response = await _patientService.getBookings(
        page: _page,
        limit: 10,
        status: widget.status,
      );

      final newBookings = response['data'] ?? [];

      if (mounted) {
        setState(() {
          if (loadMore) {
            _bookings.addAll(newBookings);
          } else {
            _bookings = newBookings;
          }
          _hasMore = newBookings.length == 10;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Lỗi tải danh sách: $e')));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading && _bookings.isEmpty) {
      return const Center(child: CircularProgressIndicator());
    }

    if (_bookings.isEmpty) {
      return Center(
        child: Text(
          'Không có lịch hẹn nào',
          style: TextStyle(color: Colors.grey.shade600),
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: () => _fetchBookings(),
      child: ListView.builder(
        controller: _scrollController,
        padding: const EdgeInsets.all(16.0),
        itemCount: _bookings.length + (_hasMore ? 1 : 0),
        itemBuilder: (context, index) {
          if (index == _bookings.length) {
            return const Center(
              child: Padding(
                padding: EdgeInsets.all(16.0),
                child: CircularProgressIndicator(),
              ),
            );
          }

          final booking = _bookings[index];
          return _buildBookingCard(booking);
        },
      ),
    );
  }

  Widget _buildBookingCard(dynamic booking) {
    final timeSlot = booking['timeSlot'];
    final doctorMetadata = booking['doctor']?['doctorMetadata'];
    final specialty = doctorMetadata?['specialty']?['name'] ?? 'Đa khoa';
    final doctorName = booking['doctor']?['name'] ?? 'Bác sĩ';

    DateTime? startTime;
    if (timeSlot != null && timeSlot['startTime'] != null) {
      startTime = DateTime.tryParse(timeSlot['startTime']);
    }

    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      child: ListTile(
        contentPadding: const EdgeInsets.all(16),
        leading: CircleAvatar(
          backgroundColor: Theme.of(context).colorScheme.primaryContainer,
          child: Icon(
            booking['clinicType'] == 'ONLINE'
                ? Icons.videocam
                : Icons.local_hospital,
            color: Theme.of(context).colorScheme.primary,
          ),
        ),
        title: Text(
          startTime != null
              ? DateFormat('HH:mm - dd/MM/yyyy').format(startTime)
              : 'Chưa xếp lịch',
          style: const TextStyle(fontWeight: FontWeight.bold),
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 4),
            Text('BS. $doctorName - $specialty'),
            const SizedBox(height: 4),
            Text(
              booking['clinicType'] == 'ONLINE'
                  ? 'Khám trực tuyến'
                  : 'Khám trực tiếp',
              style: TextStyle(
                color: booking['clinicType'] == 'ONLINE'
                    ? Colors.blue
                    : Colors.green,
                fontWeight: FontWeight.w500,
              ),
            ),
          ],
        ),
        trailing: const Icon(Icons.arrow_forward_ios, size: 16),
        onTap: () {
          context.go('/patient/bookings/${booking['id']}');
        },
      ),
    );
  }
}
