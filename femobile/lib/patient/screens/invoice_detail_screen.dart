import 'package:flutter/material.dart';

class InvoiceDetailScreen extends StatelessWidget {
  final int invoiceId;

  const InvoiceDetailScreen({super.key, required this.invoiceId});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Hóa đơn #$invoiceId')),
      body: const Center(child: Text('Chi tiết hóa đơn — Phase 4')),
    );
  }
}
