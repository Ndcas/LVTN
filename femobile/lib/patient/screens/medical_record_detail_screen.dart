import 'package:flutter/material.dart';

class MedicalRecordDetailScreen extends StatelessWidget {
  final int bookingId;

  const MedicalRecordDetailScreen({super.key, required this.bookingId});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Chi tiết bệnh án')),
      body: const Center(child: Text('Chi tiết bệnh án — Phase 2')),
    );
  }
}
