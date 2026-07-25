import 'package:flutter/material.dart';

class FeedbackScreen extends StatelessWidget {
  const FeedbackScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Gửi góp ý')),
      body: const Center(child: Text('Form gửi góp ý — Phase 4')),
    );
  }
}
