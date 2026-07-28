import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../../core/services/payment_service.dart';
import '../../core/constants/app_colors.dart';

class InvoiceListScreen extends StatefulWidget {
  const InvoiceListScreen({super.key});

  @override
  State<InvoiceListScreen> createState() => _InvoiceListScreenState();
}

class _InvoiceListScreenState extends State<InvoiceListScreen> {
  final PaymentService _paymentService = PaymentService();
  bool _isLoading = true;
  List<dynamic> _invoices = [];
  int _page = 1;
  bool _hasMore = true;
  final ScrollController _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();

    _fetchInvoices();

    _scrollController.addListener(_onScroll);
  }

  @override
  void dispose() {
    _scrollController.dispose();

    super.dispose();
  }

  void _onScroll() {
    if (_scrollController.position.pixels >=
        _scrollController.position.maxScrollExtent - 200) {
      if (!_isLoading && _hasMore) {
        _fetchInvoices(loadMore: true);
      }
    }
  }

  Future<void> _fetchInvoices({bool loadMore = false}) async {
    if (loadMore) {
      setState(() => _page++);
    } else {
      setState(() {
        _isLoading = true;
        _page = 1;
        _invoices.clear();
      });
    }

    try {
      final res = await _paymentService.getAllInvoices(page: _page, limit: 10);
      final List<dynamic> newData = res['data'] ?? [];
      final int total = res['total'] ?? 0;

      if (mounted) {
        setState(() {
          _invoices.addAll(newData);
          _hasMore = _invoices.length < total;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);

        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Lỗi tải danh sách hóa đơn: $e')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading && _invoices.isEmpty) {
      return Scaffold(
        appBar: AppBar(title: const Text('Hóa đơn của tôi')),
        body: const Center(child: CircularProgressIndicator()),
      );
    }

    return Scaffold(
      appBar: AppBar(title: const Text('Hóa đơn của tôi')),
      body: RefreshIndicator(
        onRefresh: () => _fetchInvoices(),
        child: _invoices.isEmpty
            ? const SingleChildScrollView(
                physics: AlwaysScrollableScrollPhysics(),
                child: Center(
                  child: Padding(
                    padding: EdgeInsets.all(32.0),
                    child: Text('Không có hóa đơn nào'),
                  ),
                ),
              )
            : ListView.builder(
                controller: _scrollController,
                padding: const EdgeInsets.all(16),
                itemCount: _invoices.length + (_hasMore ? 1 : 0),
                itemBuilder: (context, index) {
                  if (index == _invoices.length) {
                    return const Center(child: CircularProgressIndicator());
                  }

                  final invoice = _invoices[index];
                  final status = invoice['status'];
                  final isUnpaid = status == 'UNPAID';
                  final total = invoice['totalAmount'] ?? 0;
                  final createdAt = DateTime.tryParse(
                    invoice['createdAt'] ?? '',
                  );
                  final formatCurrency = NumberFormat.currency(
                    locale: 'vi_VN',
                    symbol: 'đ',
                  );

                  return Card(
                    margin: const EdgeInsets.only(bottom: 16),
                    child: ListTile(
                      contentPadding: const EdgeInsets.all(16),
                      leading: CircleAvatar(
                        backgroundColor: isUnpaid
                            ? Colors.orange.withOpacity(0.1)
                            : Colors.green.withOpacity(0.1),
                        child: Icon(
                          isUnpaid ? Icons.pending_actions : Icons.check_circle,
                          color: isUnpaid ? Colors.orange : Colors.green,
                        ),
                      ),
                      title: Text(
                        'Hóa đơn #${invoice['id']}',
                        style: const TextStyle(fontWeight: FontWeight.bold),
                      ),
                      subtitle: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const SizedBox(height: 4),
                          Text(
                            formatCurrency.format(total),
                            style: TextStyle(
                              color: AppColors.primary,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            createdAt != null
                                ? DateFormat(
                                    'dd/MM/yyyy HH:mm',
                                  ).format(createdAt)
                                : '',
                          ),
                        ],
                      ),
                      trailing: const Icon(Icons.chevron_right),
                      onTap: () {
                        context.push('/patient/invoice/${invoice['id']}').then((
                          _,
                        ) {
                          // Tải lại khi quay lại
                          _fetchInvoices();
                        });
                      },
                    ),
                  );
                },
              ),
      ),
    );
  }
}
