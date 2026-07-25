import 'package:flutter/material.dart';

class PatientHomeScreen extends StatelessWidget {
  const PatientHomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Trang chủ')),
      body: const Center(
        child: Text('Trang chủ bệnh nhân — Sẽ triển khai ở Phase 2'),
      ),
    );
  }
}
