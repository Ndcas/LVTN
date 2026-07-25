import 'package:flutter/material.dart';

class DoctorHomeScreen extends StatelessWidget {
  const DoctorHomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Lịch khám hôm nay')),
      body: const Center(child: Text('Dashboard bác sĩ — Phase 3')),
    );
  }
}
