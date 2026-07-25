import 'package:flutter/material.dart';

class BookingListScreen extends StatelessWidget {
  const BookingListScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Lịch hẹn của tôi')),
      body: const Center(child: Text('Danh sách lịch hẹn — Phase 2')),
    );
  }
}
