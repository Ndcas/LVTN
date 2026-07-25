import 'package:flutter/material.dart';

class DoctorBookingDetailScreen extends StatelessWidget {
  final int bookingId;

  const DoctorBookingDetailScreen({super.key, required this.bookingId});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Lịch hẹn #$bookingId')),
      body: const Center(child: Text('Chi tiết lịch hẹn (BS) — Phase 3')),
    );
  }
}
