import 'package:flutter/material.dart';

class ExaminationScreen extends StatelessWidget {
  final int bookingId;

  const ExaminationScreen({super.key, required this.bookingId});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Khám bệnh')),
      body: const Center(child: Text('Form khám bệnh — Phase 3')),
    );
  }
}
