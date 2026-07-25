import 'package:flutter/material.dart';

class LeaveRequestScreen extends StatelessWidget {
  const LeaveRequestScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Đơn nghỉ phép')),
      body: const Center(child: Text('Quản lý nghỉ phép — Phase 3')),
    );
  }
}
