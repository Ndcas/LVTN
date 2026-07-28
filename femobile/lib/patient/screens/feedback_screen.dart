import 'package:flutter/material.dart';
import '../../core/services/shared_service.dart';
import '../../core/constants/app_colors.dart';

class FeedbackScreen extends StatefulWidget {
  const FeedbackScreen({super.key});

  @override
  State<FeedbackScreen> createState() => _FeedbackScreenState();
}

class _FeedbackScreenState extends State<FeedbackScreen> {
  final SharedService _sharedService = SharedService();
  final TextEditingController _contentController = TextEditingController();
  bool _isSubmitting = false;

  Future<void> _submitFeedback() async {
    final content = _contentController.text.trim();

    if (content.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Vui lòng nhập nội dung góp ý')),
      );

      return;
    }

    setState(() => _isSubmitting = true);

    try {
      await _sharedService.sendFeedback(content);

      if (mounted) {
        setState(() => _isSubmitting = false);

        _contentController.clear();

        showDialog(
          context: context,
          builder: (context) => AlertDialog(
            title: const Row(
              children: [
                Icon(Icons.check_circle, color: Colors.green),
                SizedBox(width: 8),
                Text('Thành công'),
              ],
            ),
            content: const Text(
              'Cảm ơn bạn đã gửi ý kiến đóng góp! Chúng tôi sẽ ghi nhận và cải thiện dịch vụ.',
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(context),
                child: const Text('Đóng'),
              ),
            ],
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isSubmitting = false);

        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Lỗi gửi góp ý: $e')));
      }
    }
  }

  @override
  void dispose() {
    _contentController.dispose();

    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Góp ý dịch vụ')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Text(
              'Ý kiến của bạn giúp chúng tôi cải thiện chất lượng phục vụ ngày một tốt hơn.',
              style: TextStyle(fontSize: 16, color: Colors.black87),
            ),
            const SizedBox(height: 24),
            TextField(
              controller: _contentController,
              maxLines: 6,
              decoration: const InputDecoration(
                hintText: 'Nhập nội dung góp ý của bạn ở đây...',
                alignLabelWithHint: true,
              ),
            ),
            const SizedBox(height: 32),
            ElevatedButton(
              onPressed: _isSubmitting ? null : _submitFeedback,
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 16),
              ),
              child: _isSubmitting
                  ? const CircularProgressIndicator(color: Colors.white)
                  : const Text('Gửi góp ý', style: TextStyle(fontSize: 16)),
            ),
          ],
        ),
      ),
    );
  }
}
