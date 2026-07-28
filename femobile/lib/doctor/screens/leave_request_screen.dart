import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../core/services/doctor_service.dart';

class LeaveRequestScreen extends StatefulWidget {
  const LeaveRequestScreen({super.key});

  @override
  State<LeaveRequestScreen> createState() => _LeaveRequestScreenState();
}

class _LeaveRequestScreenState extends State<LeaveRequestScreen> {
  final DoctorService _doctorService = DoctorService();
  bool _isLoading = true;
  List<dynamic> _leaves = [];
  int _page = 1;
  bool _hasMore = true;
  final ScrollController _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();

    _fetchLeaves();

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
        _fetchLeaves(loadMore: true);
      }
    }
  }

  Future<void> _fetchLeaves({bool loadMore = false}) async {
    if (loadMore) {
      setState(() => _page++);
    } else {
      setState(() {
        _isLoading = true;
        _page = 1;
        _leaves.clear();
      });
    }

    try {
      final response = await _doctorService.getLeaves(page: _page, limit: 10);
      final List<dynamic> newData = response['data'] ?? [];
      final int total = response['total'] ?? 0;

      if (mounted) {
        setState(() {
          _leaves.addAll(newData);
          _hasMore = _leaves.length < total;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);

        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Lỗi tải danh sách nghỉ phép: $e')),
        );
      }
    }
  }

  void _showCreateLeaveBottomSheet() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (context) => Padding(
        padding: EdgeInsets.only(
          bottom: MediaQuery.of(context).viewInsets.bottom,
        ),
        child: _CreateLeaveForm(
          onSubmit: (date, reason) async {
            Navigator.pop(context); // Close bottom sheet
            await _createLeave(date, reason);
          },
        ),
      ),
    );
  }

  Future<void> _createLeave(DateTime date, String reason) async {
    try {
      showDialog(
        context: context,
        barrierDismissible: false,
        builder: (context) => const Center(child: CircularProgressIndicator()),
      );

      final dateStr = DateFormat('yyyy-MM-dd').format(date);

      await _doctorService.createLeave({'date': dateStr, 'reason': reason});

      if (mounted) {
        Navigator.pop(context); // Close loading

        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Đã gửi đơn nghỉ phép thành công')),
        );

        _fetchLeaves(); // Reload list
      }
    } catch (e) {
      if (mounted) {
        Navigator.pop(context); // Close loading

        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Lỗi tạo đơn: $e')));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Đơn nghỉ phép')),
      body: _buildBody(),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _showCreateLeaveBottomSheet,
        icon: const Icon(Icons.add),
        label: const Text('Tạo đơn'),
      ),
    );
  }

  Widget _buildBody() {
    if (_isLoading && _leaves.isEmpty) {
      return const Center(child: CircularProgressIndicator());
    }

    if (_leaves.isEmpty) {
      return const Center(child: Text('Bạn chưa có đơn nghỉ phép nào'));
    }

    return ListView.builder(
      controller: _scrollController,
      padding: const EdgeInsets.only(left: 16, right: 16, top: 16, bottom: 80),
      itemCount: _leaves.length + (_hasMore ? 1 : 0),
      itemBuilder: (context, index) {
        if (index == _leaves.length) {
          return const Padding(
            padding: EdgeInsets.symmetric(vertical: 16.0),
            child: Center(child: CircularProgressIndicator()),
          );
        }

        final leave = _leaves[index];
        final date = DateTime.tryParse(leave['date'] ?? '');
        final status = leave['status'] ?? '';
        final reason = leave['reason'] ?? 'Không có lý do';
        final rejectedReason = leave['rejectedReason'];
        Color statusColor;
        String statusText;

        switch (status) {
          case 'PENDING':
            statusColor = Colors.orange;
            statusText = 'Chờ duyệt';
            break;
          case 'APPROVED':
            statusColor = Colors.green;
            statusText = 'Đã duyệt';
            break;
          case 'REJECTED':
            statusColor = Colors.red;
            statusText = 'Từ chối';
            break;
          default:
            statusColor = Colors.grey;
            statusText = status;
        }

        return Card(
          margin: const EdgeInsets.only(bottom: 16),
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      date != null ? DateFormat('dd/MM/yyyy').format(date) : '',
                      style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 16,
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 8,
                        vertical: 4,
                      ),
                      decoration: BoxDecoration(
                        color: statusColor.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(4),
                        border: Border.all(color: statusColor),
                      ),
                      child: Text(
                        statusText,
                        style: TextStyle(
                          color: statusColor,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Text('Lý do: $reason'),
                if (status == 'REJECTED' && rejectedReason != null) ...[
                  const SizedBox(height: 8),
                  Text(
                    'Lý do từ chối: $rejectedReason',
                    style: const TextStyle(color: Colors.red),
                  ),
                ],
              ],
            ),
          ),
        );
      },
    );
  }
}

class _CreateLeaveForm extends StatefulWidget {
  final Function(DateTime date, String reason) onSubmit;

  const _CreateLeaveForm({required this.onSubmit});

  @override
  State<_CreateLeaveForm> createState() => _CreateLeaveFormState();
}

class _CreateLeaveFormState extends State<_CreateLeaveForm> {
  final _formKey = GlobalKey<FormState>();
  DateTime? _selectedDate;
  String _reason = '';

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Form(
        key: _formKey,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Text(
              'Tạo đơn xin nghỉ phép',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            ListTile(
              contentPadding: EdgeInsets.zero,
              title: const Text('Ngày nghỉ'),
              subtitle: Text(
                _selectedDate != null
                    ? DateFormat('dd/MM/yyyy').format(_selectedDate!)
                    : 'Chưa chọn ngày',
              ),
              trailing: const Icon(Icons.calendar_today),
              onTap: () async {
                final date = await showDatePicker(
                  context: context,
                  initialDate: DateTime.now().add(const Duration(days: 1)),
                  firstDate: DateTime.now(),
                  lastDate: DateTime.now().add(const Duration(days: 365)),
                );
                if (date != null) {
                  setState(() => _selectedDate = date);
                }
              },
            ),
            const SizedBox(height: 16),
            TextFormField(
              decoration: const InputDecoration(
                labelText: 'Lý do nghỉ phép',
                border: OutlineInputBorder(),
              ),
              maxLines: 3,
              validator: (value) =>
                  value == null || value.isEmpty ? 'Vui lòng nhập lý do' : null,
              onSaved: (value) => _reason = value ?? '',
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: () {
                if (_selectedDate == null) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Vui lòng chọn ngày nghỉ')),
                  );
                  return;
                }
                if (_formKey.currentState!.validate()) {
                  _formKey.currentState!.save();
                  widget.onSubmit(_selectedDate!, _reason);
                }
              },
              style: ElevatedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 16),
              ),
              child: const Text('Gửi yêu cầu', style: TextStyle(fontSize: 16)),
            ),
          ],
        ),
      ),
    );
  }
}
