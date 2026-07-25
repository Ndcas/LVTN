import 'package:flutter/material.dart';

class ChangeRequestScreen extends StatelessWidget {
  const ChangeRequestScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Yêu cầu đổi lịch')),
      body: const Center(child: Text('Quản lý đổi lịch — Phase 3')),
    );
  }
}
