import 'package:dio/dio.dart';
import 'package:femobile/core/services/api_service.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
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
  bool _isActive = true;

  @override
  void initState() {
    super.initState();

    _fetchTodayBookings();
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();

    final location = GoRouterState.of(context).uri.path;
    final isCurrentlyActive = (location == '/doctor');

    if (isCurrentlyActive && !_isActive) {
      _fetchTodayBookings();
    }

    _isActive = isCurrentlyActive;
  }

  Future<void> _fetchTodayBookings() async {
    try {
      final today = DateFormat('yyyy-MM-dd').format(DateTime.now());
      final response = await _doctorService.getBookings(
        page: 1,
        limit: 100, // Fetch all for today
        status: 'CONFIRMED',
        date: today,
      );

      if (mounted) {
        setState(() {
          _todayBookings = response['data'] ?? [];
          // Sort by time
          _todayBookings.sort((a, b) {
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
        title: const Text('Lịch khám hôm nay'),
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
                    'Bạn không có ca khám nào hôm nay',
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
        final timeString = (startTimeStr != null && startTimeStr.length >= 5)
            ? startTimeStr.substring(0, 5)
            : 'Chưa xếp lịch';

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
                const SizedBox(height: 8),
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
