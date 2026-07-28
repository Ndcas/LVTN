import 'package:flutter/material.dart';
import '../../core/services/shared_service.dart';

class NotificationScreen extends StatefulWidget {
  const NotificationScreen({super.key});

  @override
  State<NotificationScreen> createState() => _NotificationScreenState();
}

class _NotificationScreenState extends State<NotificationScreen> {
  final SharedService _sharedService = SharedService();
  bool _isLoading = true;
  List<dynamic> _notifications = [];
  int _page = 1;
  bool _hasMore = true;
  final ScrollController _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();

    _fetchNotifications();

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
        _fetchNotifications(loadMore: true);
      }
    }
  }

  Future<void> _fetchNotifications({bool loadMore = false}) async {
    if (loadMore) {
      setState(() => _page++);
    } else {
      setState(() {
        _isLoading = true;
        _page = 1;
        _notifications.clear();
      });
    }

    try {
      final res = await _sharedService.getNotifications(page: _page, limit: 20);
      final List<dynamic> newData = res['data'] ?? [];
      final int total = res['total'] ?? 0;

      if (mounted) {
        setState(() {
          _notifications.addAll(newData);
          _hasMore = _notifications.length < total;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);

        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Lỗi tải thông báo: $e')));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading && _notifications.isEmpty) {
      return Scaffold(
        appBar: AppBar(title: const Text('Thông báo')),
        body: const Center(child: CircularProgressIndicator()),
      );
    }

    return Scaffold(
      appBar: AppBar(title: const Text('Thông báo')),
      body: RefreshIndicator(
        onRefresh: () => _fetchNotifications(),
        child: _notifications.isEmpty
            ? const SingleChildScrollView(
                physics: AlwaysScrollableScrollPhysics(),
                child: Center(
                  child: Padding(
                    padding: EdgeInsets.all(32.0),
                    child: Text('Bạn chưa có thông báo nào'),
                  ),
                ),
              )
            : ListView.separated(
                controller: _scrollController,
                padding: const EdgeInsets.all(16),
                itemCount: _notifications.length + (_hasMore ? 1 : 0),
                separatorBuilder: (context, index) => const Divider(),
                itemBuilder: (context, index) {
                  if (index == _notifications.length) {
                    return const Center(child: CircularProgressIndicator());
                  }

                  final notif = _notifications[index];
                  final title = notif['title'] ?? 'Thông báo';
                  final content = notif['content'] ?? '';
                  final createdAt = notif['createdAt'];

                  return ListTile(
                    contentPadding: EdgeInsets.zero,
                    leading: const CircleAvatar(
                      backgroundColor: Colors.blueAccent,
                      child: Icon(Icons.notifications, color: Colors.white),
                    ),
                    title: Text(
                      title,
                      style: const TextStyle(fontWeight: FontWeight.bold),
                    ),
                    subtitle: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const SizedBox(height: 4),
                        Text(content),
                        const SizedBox(height: 4),
                        if (createdAt != null)
                          Text(
                            _formatDate(createdAt),
                            style: const TextStyle(
                              fontSize: 12,
                              color: Colors.grey,
                            ),
                          ),
                      ],
                    ),
                  );
                },
              ),
      ),
    );
  }

  String _formatDate(String isoString) {
    try {
      final date = DateTime.parse(isoString).toLocal();

      return '${date.hour.toString().padLeft(2, '0')}:${date.minute.toString().padLeft(2, '0')} ${date.day.toString().padLeft(2, '0')}/${date.month.toString().padLeft(2, '0')}/${date.year}';
    } catch (_) {
      return isoString;
    }
  }
}
