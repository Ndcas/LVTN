import 'package:flutter/material.dart';

class PatientRecordsScreen extends StatelessWidget {
  final int patientId;

  const PatientRecordsScreen({super.key, required this.patientId});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Hồ sơ bệnh nhân')),
      body: const Center(child: Text('Lịch sử khám bệnh nhân — Phase 3')),
    );
  }
}
