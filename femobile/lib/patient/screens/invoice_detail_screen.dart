import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../../core/services/payment_service.dart';
import '../../core/constants/app_colors.dart';

class InvoiceDetailScreen extends StatefulWidget {
  final int invoiceId;

  const InvoiceDetailScreen({super.key, required this.invoiceId});

  @override
  State<InvoiceDetailScreen> createState() => _InvoiceDetailScreenState();
}

class _InvoiceDetailScreenState extends State<InvoiceDetailScreen> {
  final PaymentService _paymentService = PaymentService();
  bool _isLoading = true;
  dynamic _invoice;

  @override
  void initState() {
    super.initState();

    _fetchInvoice();
  }

  Future<void> _fetchInvoice() async {
    try {
      final res = await _paymentService.getInvoice(widget.invoiceId);

      if (mounted) {
        setState(() {
          _invoice = res;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);

        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Lỗi tải hóa đơn: $e')));
      }
    }
  }

  Future<void> _payWithVNPay() async {
    try {
      showDialog(
        context: context,
        barrierDismissible: false,
        builder: (context) => const Center(child: CircularProgressIndicator()),
      );

      final url = await _paymentService.createPaymentUrl(widget.invoiceId);

      if (mounted) {
        Navigator.pop(context); // close dialog

        context.push(
          '/patient/vnpay',
          extra: {
            'url': url,
            'onComplete': (bool success) {
              if (success) {
                _fetchInvoice();
              }
            },
          },
        );
      }
    } catch (e) {
      if (mounted) {
        Navigator.pop(context); // close dialog

        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Lỗi tạo thanh toán: $e')));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return Scaffold(
        appBar: AppBar(title: const Text('Chi tiết hóa đơn')),
        body: const Center(child: CircularProgressIndicator()),
      );
    }

    if (_invoice == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Chi tiết hóa đơn')),
        body: const Center(child: Text('Không tìm thấy hóa đơn')),
      );
    }

    final formatCurrency = NumberFormat.currency(locale: 'vi_VN', symbol: 'đ');
    final examFee = _invoice['examinationFee'] ?? 0;
    final medicineFee = _invoice['medicineFee'] ?? 0;
    final total = _invoice['totalAmount'] ?? 0;
    final status = _invoice['status'];
    final isUnpaid = status == 'UNPAID';

    return Scaffold(
      appBar: AppBar(title: const Text('Chi tiết hóa đơn')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  children: [
                    Icon(
                      isUnpaid ? Icons.pending_actions : Icons.check_circle,
                      color: isUnpaid ? Colors.orange : Colors.green,
                      size: 64,
                    ),
                    const SizedBox(height: 8),
                    Text(
                      isUnpaid ? 'Chưa thanh toán' : 'Đã thanh toán',
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                        color: isUnpaid ? Colors.orange : Colors.green,
                      ),
                    ),
                    const SizedBox(height: 24),
                    _buildRow('Mã hóa đơn', '#${_invoice['id']}'),
                    const Divider(),
                    _buildRow('Tiền khám', formatCurrency.format(examFee)),
                    const Divider(),
                    _buildRow('Tiền thuốc', formatCurrency.format(medicineFee)),
                    const Divider(),
                    _buildRow(
                      'Tổng cộng',
                      formatCurrency.format(total),
                      isBold: true,
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),
            if (isUnpaid)
              ElevatedButton(
                onPressed: _payWithVNPay,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                ),
                child: const Text(
                  'Thanh toán qua VNPAY',
                  style: TextStyle(fontSize: 16),
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildRow(String label, String value, {bool isBold = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: Colors.grey, fontSize: 16)),
          Text(
            value,
            style: TextStyle(
              fontWeight: isBold ? FontWeight.bold : FontWeight.w500,
              fontSize: isBold ? 18 : 16,
              color: isBold ? AppColors.primary : AppColors.textHeading,
            ),
          ),
        ],
      ),
    );
  }
}
