import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:webview_flutter/webview_flutter.dart';

class VNPayWebViewScreen extends StatefulWidget {
  final String url;
  final Function(bool success) onComplete;

  const VNPayWebViewScreen({
    super.key,
    required this.url,
    required this.onComplete,
  });

  @override
  State<VNPayWebViewScreen> createState() => _VNPayWebViewScreenState();
}

class _VNPayWebViewScreenState extends State<VNPayWebViewScreen> {
  late final WebViewController _controller;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();

    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setNavigationDelegate(
        NavigationDelegate(
          onPageStarted: (String url) {
            setState(() => _isLoading = true);
          },
          onPageFinished: (String url) {
            setState(() => _isLoading = false);
          },
          onNavigationRequest: (NavigationRequest request) {
            // Check if it's the return URL
            if (request.url.contains('/vnpay/return') ||
                request.url.contains('vnp_ResponseCode')) {
              _handleVNPayReturn(request.url);
              return NavigationDecision
                  .prevent; // Prevent loading the backend URL on WebView
            }
            return NavigationDecision.navigate;
          },
        ),
      )
      ..loadRequest(Uri.parse(widget.url));
  }

  void _handleVNPayReturn(String urlString) {
    final uri = Uri.parse(urlString);
    final responseCode = uri.queryParameters['vnp_ResponseCode'];

    if (responseCode == '00') {
      _showResultDialog(
        title: 'Thanh toán thành công',
        message: 'Giao dịch của bạn đã được xử lý thành công.',
        isSuccess: true,
      );
    } else {
      _showResultDialog(
        title: 'Thanh toán thất bại',
        message: 'Giao dịch bị hủy hoặc xảy ra lỗi (Mã lỗi: $responseCode).',
        isSuccess: false,
      );
    }
  }

  void _showResultDialog({
    required String title,
    required String message,
    required bool isSuccess,
  }) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        title: Row(
          children: [
            Icon(
              isSuccess ? Icons.check_circle : Icons.error,
              color: isSuccess ? Colors.green : Colors.red,
            ),
            const SizedBox(width: 8),
            Text(title),
          ],
        ),
        content: Text(message),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.pop(context); // Close dialog
              context.pop(); // Close webview screen
              widget.onComplete(isSuccess);
            },
            child: const Text('Đóng'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Thanh toán VNPAY'),
        leading: IconButton(
          icon: const Icon(Icons.close),
          onPressed: () {
            widget.onComplete(false);
            context.pop();
          },
        ),
      ),
      body: Stack(
        children: [
          WebViewWidget(controller: _controller),
          if (_isLoading) const Center(child: CircularProgressIndicator()),
        ],
      ),
    );
  }
}
