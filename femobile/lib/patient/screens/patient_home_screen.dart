import 'package:dio/dio.dart';
import 'package:femobile/core/services/api_service.dart';
import 'package:femobile/core/providers/booking_notifier.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../../core/services/patient_service.dart';
import 'package:intl/intl.dart';

class PatientHomeScreen extends StatefulWidget {
  const PatientHomeScreen({super.key});

  @override
  State<PatientHomeScreen> createState() => _PatientHomeScreenState();
}

class _PatientHomeScreenState extends State<PatientHomeScreen> {
  final PatientService _patientService = PatientService();
  bool _isLoading = true;
  List<dynamic> _upcomingBookings = [];
  BookingNotifier? _bookingNotifier;

  @override
  void initState() {
    super.initState();

    _fetchUpcomingBookings();
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();

    final notifier = context.read<BookingNotifier>();

    if (_bookingNotifier == null) {
      _bookingNotifier = notifier;

      _bookingNotifier!.addListener(_fetchUpcomingBookings);
    }
  }

  @override
  void dispose() {
    _bookingNotifier?.removeListener(_fetchUpcomingBookings);

    super.dispose();
  }

  Future<void> _fetchUpcomingBookings() async {
    try {
      final response = await _patientService.getBookings(
        page: 1,
        limit: 2,
        status: 'CONFIRMED',
      );

      if (mounted) {
        setState(() {
          _upcomingBookings = response['data'] ?? [];
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });

        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              'Lỗi tải lịch hẹn: ${e is DioException ? parseDioError(e) : e.toString()}',
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
        title: const Text('Trang chủ'),
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications),
            onPressed: () => context.go('/patient/profile/notifications'),
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _fetchUpcomingBookings,
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Lịch hẹn sắp tới',
                style: Theme.of(
                  context,
                ).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 16),
              _buildUpcomingBookings(),
              const SizedBox(height: 32),
              Text(
                'Dịch vụ của chúng tôi',
                style: Theme.of(
                  context,
                ).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 16),
              _buildQuickActions(context),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildUpcomingBookings() {
    if (_isLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (_upcomingBookings.isEmpty) {
      return Card(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            children: [
              const Icon(Icons.calendar_today, size: 48, color: Colors.grey),
              const SizedBox(height: 16),
              const Text(
                'Bạn chưa có lịch hẹn nào sắp tới',
                style: TextStyle(color: Colors.grey),
              ),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: () => context.go('/patient/book'),
                child: const Text('Đặt lịch ngay'),
              ),
            ],
          ),
        ),
      );
    }

    return Column(
      children: _upcomingBookings.map((booking) {
        final clinicType = booking['clinicType'];
        DateTime? startTime;

        if (booking['clinicDate'] != null && booking['startTime'] != null) {
          final datePart = booking['clinicDate'].toString().split('T')[0];
          startTime = DateTime.tryParse('$datePart ${booking['startTime']}');
        }

        return Card(
          margin: const EdgeInsets.only(bottom: 16),
          child: ListTile(
            contentPadding: const EdgeInsets.all(16),
            leading: CircleAvatar(
              backgroundColor: Theme.of(context).colorScheme.primaryContainer,
              child: Icon(
                clinicType == 'ONLINE' ? Icons.videocam : Icons.local_hospital,
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
                Text(
                  clinicType == 'ONLINE' ? 'Khám trực tuyến' : 'Khám trực tiếp',
                  style: TextStyle(
                    color: clinicType == 'ONLINE' ? Colors.blue : Colors.green,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
            trailing: const Icon(Icons.arrow_forward_ios, size: 16),
            onTap: () {
              context.push('/patient/bookings/${booking['id']}');
            },
          ),
        );
      }).toList(),
    );
  }

  Widget _buildQuickActions(BuildContext context) {
    return GridView.count(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisCount: 2,
      mainAxisSpacing: 16,
      crossAxisSpacing: 16,
      children: [
        _ActionCard(
          title: 'Đặt lịch khám',
          icon: Icons.calendar_month,
          color: Colors.blue,
          onTap: () => context.go('/patient/book'),
        ),
        _ActionCard(
          title: 'Lịch sử khám',
          icon: Icons.history,
          color: Colors.green,
          onTap: () => context.go('/patient/records'),
        ),
        _ActionCard(
          title: 'Góp ý',
          icon: Icons.feedback,
          color: Colors.orange,
          onTap: () => context.go('/patient/feedback'),
        ),
        _ActionCard(
          title: 'Hóa đơn',
          icon: Icons.receipt_long,
          color: Colors.blue,
          onTap: () => context.go('/patient/invoices'),
        ),
        _ActionCard(
          title: 'Hồ sơ',
          icon: Icons.person,
          color: Colors.purple,
          onTap: () => context.go('/patient/profile'),
        ),
      ],
    );
  }
}

class _ActionCard extends StatelessWidget {
  final String title;
  final IconData icon;
  final Color color;
  final VoidCallback onTap;

  const _ActionCard({
    required this.title,
    required this.icon,
    required this.color,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        decoration: BoxDecoration(
          color: color.withOpacity(0.1),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: color.withOpacity(0.2)),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: color.withOpacity(0.2),
                shape: BoxShape.circle,
              ),
              child: Icon(icon, color: color, size: 32),
            ),
            const SizedBox(height: 12),
            Text(
              title,
              style: TextStyle(
                fontWeight: FontWeight.bold,
                color: color.withOpacity(0.8),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
