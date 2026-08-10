import 'package:dio/dio.dart';
import 'package:femobile/core/services/api_service.dart';
import 'package:femobile/core/providers/booking_notifier.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../../core/services/doctor_service.dart';
import 'package:intl/intl.dart';

class DoctorHomeScreen extends StatefulWidget {
  const DoctorHomeScreen({super.key});

  @override
  State<DoctorHomeScreen> createState() => _DoctorHomeScreenState();
}

class _DoctorHomeScreenState extends State<DoctorHomeScreen> {
  final DoctorService _doctorService = DoctorService();
  bool _isLoading = true;
  List<dynamic> _todayBookings = [];
  BookingNotifier? _bookingNotifier;

  @override
  void initState() {
    super.initState();

    _fetchTodayBookings();
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();

    final notifier = context.read<BookingNotifier>();

    if (_bookingNotifier == null) {
      _bookingNotifier = notifier;

      _bookingNotifier!.addListener(_fetchTodayBookings);
    }
  }

  @override
  void dispose() {
    _bookingNotifier?.removeListener(_fetchTodayBookings);

    super.dispose();
  }

  Future<void> _fetchTodayBookings() async {
    try {
      final response = await _doctorService.getBookings(
        page: 1,
        limit: 100,
        status: 'CONFIRMED',
      );

      if (mounted) {
        setState(() {
          _todayBookings = response['data'] ?? [];

          _todayBookings.sort((a, b) {
            final aDate = a['clinicDate'] ?? '';
            final bDate = b['clinicDate'] ?? '';
            final dateCmp = aDate.compareTo(bDate);

            if (dateCmp != 0) {
              return dateCmp;
            }

            final aTime = a['startTime'] ?? '';
            final bTime = b['startTime'] ?? '';

            return aTime.compareTo(bTime);
          });

          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);

        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              'Lỗi tải lịch khám: ${e is DioException ? parseDioError(e) : e.toString()}',
            ),
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Lịch khám sắp tới'),
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications),
            onPressed: () => context.go('/doctor/notifications'),
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _fetchTodayBookings,
        child: _buildBody(),
      ),
    );
  }

  Widget _buildBody() {
    if (_isLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (_todayBookings.isEmpty) {
      return CustomScrollView(
        slivers: [
          SliverFillRemaining(
            child: Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(
                    Icons.event_available,
                    size: 64,
                    color: Colors.grey,
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'Bạn không có ca khám nào sắp tới',
                    style: TextStyle(color: Colors.grey.shade600, fontSize: 16),
                  ),
                ],
              ),
            ),
          ),
        ],
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16.0),
      itemCount: _todayBookings.length,
      itemBuilder: (context, index) {
        final booking = _todayBookings[index];
        final startTimeStr = booking['startTime'] as String?;
        final endTimeStr = booking['endTime'] as String?;
        final clinicDateStr = booking['clinicDate'] as String?;

        final timeString =
            (startTimeStr != null &&
                endTimeStr != null &&
                startTimeStr.length >= 5 &&
                endTimeStr.length >= 5)
            ? '${startTimeStr.substring(0, 5)} - ${endTimeStr.substring(0, 5)}'
            : 'Chưa xếp lịch';

        final dateString = () {
          if (clinicDateStr == null) return '';
          try {
            final parsed = DateTime.parse(clinicDateStr);
            final today = DateTime.now();
            final tomorrow = today.add(const Duration(days: 1));
            if (parsed.year == today.year &&
                parsed.month == today.month &&
                parsed.day == today.day) {
              return 'Hôm nay, ${DateFormat('dd/MM/yyyy').format(parsed)}';
            } else if (parsed.year == tomorrow.year &&
                parsed.month == tomorrow.month &&
                parsed.day == tomorrow.day) {
              return 'Ngày mai, ${DateFormat('dd/MM/yyyy').format(parsed)}';
            }
            return DateFormat('dd/MM/yyyy').format(parsed);
          } catch (_) {
            return clinicDateStr;
          }
        }();

        return Card(
          margin: const EdgeInsets.only(bottom: 16),
          child: ListTile(
            contentPadding: const EdgeInsets.all(16),
            leading: CircleAvatar(
              backgroundColor: Theme.of(context).colorScheme.primaryContainer,
              child: Icon(
                booking['clinicType'] == 'ONLINE'
                    ? Icons.videocam
                    : Icons.person,
                color: Theme.of(context).colorScheme.primary,
              ),
            ),
            title: Text(
              timeString,
              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
            ),
            subtitle: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: 4),
                Row(
                  children: [
                    Icon(
                      Icons.calendar_today,
                      size: 13,
                      color: Colors.grey.shade600,
                    ),
                    const SizedBox(width: 4),
                    Text(
                      dateString,
                      style: TextStyle(
                        fontSize: 13,
                        color: Colors.grey.shade700,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ),
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
              context.push('/doctor/bookings/${booking['id']}');
            },
          ),
        );
      },
    );
  }
}
