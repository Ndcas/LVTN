import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:dio/dio.dart';
import '../../core/constants/app_colors.dart';
import '../../core/services/auth_service.dart';
import '../../core/services/api_service.dart';

/// Đăng ký 2 bước:
/// - Bước 1: Nhập email → Gửi OTP
/// - Bước 2: Nhập OTP + thông tin cá nhân → Tạo tài khoản
class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _authService = AuthService();
  final _step1Key = GlobalKey<FormState>();
  final _step2Key = GlobalKey<FormState>();
  int _step = 0;
  bool _loading = false;

  // Step 1
  final _emailCtrl = TextEditingController();

  // Step 2
  final _otpCtrl = TextEditingController();
  final _nameCtrl = TextEditingController();
  final _phoneCtrl = TextEditingController();
  final _passCtrl = TextEditingController();
  final _dobCtrl = TextEditingController();
  final _addressCtrl = TextEditingController();
  String _gender = 'MALE';
  bool _obscurePass = true;

  @override
  void dispose() {
    _emailCtrl.dispose();

    _otpCtrl.dispose();

    _nameCtrl.dispose();

    _phoneCtrl.dispose();

    _passCtrl.dispose();

    _dobCtrl.dispose();

    _addressCtrl.dispose();

    super.dispose();
  }

  Future<void> _sendOtp() async {
    if (!_step1Key.currentState!.validate()) {
      return;
    }

    setState(() => _loading = true);

    try {
      await _authService.getRegisterOtp(_emailCtrl.text.trim());

      setState(() => _step = 1);

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('OTP đã được gửi đến email của bạn')),
        );
      }
    } on DioException catch (e) {
      _showError(parseDioError(e));
    } finally {
      if (mounted) {
        setState(() => _loading = false);
      }
    }
  }

  Future<void> _register() async {
    if (!_step2Key.currentState!.validate()) {
      return;
    }

    setState(() => _loading = true);

    try {
      await _authService.register(
        email: _emailCtrl.text.trim(),
        password: _passCtrl.text,
        phone: _phoneCtrl.text.trim(),
        fullName: _nameCtrl.text.trim(),
        gender: _gender,
        otp: _otpCtrl.text.trim(),
        dob: _dobCtrl.text.isNotEmpty ? _dobCtrl.text : null,
        address: _addressCtrl.text.isNotEmpty ? _addressCtrl.text : null,
      );

      if (!mounted) {
        return;
      }

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Đăng ký thành công! Vui lòng đăng nhập')),
      );

      context.go('/login');
    } on DioException catch (e) {
      _showError(parseDioError(e));
    } finally {
      if (mounted) {
        setState(() => _loading = false);
      }
    }
  }

  void _showError(String msg) {
    if (!mounted) {
      return;
    }

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(msg), backgroundColor: AppColors.danger),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(_step == 0 ? 'Đăng ký' : 'Thông tin cá nhân'),
        leading: _step == 1
            ? IconButton(
                icon: const Icon(Icons.arrow_back),
                onPressed: () => setState(() => _step = 0),
              )
            : null,
      ),
      backgroundColor: AppColors.backgroundBody,
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: _step == 0 ? _buildStep1() : _buildStep2(),
      ),
    );
  }

  Widget _buildStep1() {
    return Form(
      key: _step1Key,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const SizedBox(height: 16),
          const Text(
            'Bước 1: Nhập email để nhận OTP',
            style: TextStyle(color: AppColors.textMuted),
          ),
          const SizedBox(height: 20),
          TextFormField(
            controller: _emailCtrl,
            keyboardType: TextInputType.emailAddress,
            decoration: const InputDecoration(
              labelText: 'Email',
              prefixIcon: Icon(Icons.email_outlined),
            ),
            validator: (v) {
              if (v == null || v.isEmpty) return 'Vui lòng nhập email';
              if (!v.contains('@')) return 'Email không hợp lệ';
              return null;
            },
          ),
          const SizedBox(height: 24),
          FilledButton(
            onPressed: _loading ? null : _sendOtp,
            style: FilledButton.styleFrom(
              backgroundColor: AppColors.primary,
              padding: const EdgeInsets.symmetric(vertical: 14),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(10),
              ),
            ),
            child: _loading
                ? const SizedBox(
                    height: 20,
                    width: 20,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      color: Colors.white,
                    ),
                  )
                : const Text('Gửi OTP', style: TextStyle(fontSize: 16)),
          ),
          const SizedBox(height: 20),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Text(
                'Đã có tài khoản? ',
                style: TextStyle(color: AppColors.textMuted),
              ),
              GestureDetector(
                onTap: () => context.pop(),
                child: const Text(
                  'Đăng nhập',
                  style: TextStyle(
                    color: AppColors.primary,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildStep2() {
    return Form(
      key: _step2Key,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const Text(
            'Bước 2: Điền thông tin để hoàn tất đăng ký',
            style: TextStyle(color: AppColors.textMuted),
          ),
          const SizedBox(height: 20),
          // OTP
          TextFormField(
            controller: _otpCtrl,
            keyboardType: TextInputType.number,
            decoration: const InputDecoration(
              labelText: 'Mã OTP',
              prefixIcon: Icon(Icons.pin_outlined),
            ),
            validator: (v) => (v == null || v.isEmpty) ? 'Nhập mã OTP' : null,
          ),
          const SizedBox(height: 12),
          // Họ tên
          TextFormField(
            controller: _nameCtrl,
            decoration: const InputDecoration(
              labelText: 'Họ và tên *',
              prefixIcon: Icon(Icons.person_outline),
            ),
            validator: (v) => (v == null || v.isEmpty) ? 'Nhập họ tên' : null,
          ),
          const SizedBox(height: 12),
          // SĐT
          TextFormField(
            controller: _phoneCtrl,
            keyboardType: TextInputType.phone,
            decoration: const InputDecoration(
              labelText: 'Số điện thoại *',
              prefixIcon: Icon(Icons.phone_outlined),
            ),
            validator: (v) =>
                (v == null || v.isEmpty) ? 'Nhập số điện thoại' : null,
          ),
          const SizedBox(height: 12),
          // Mật khẩu
          TextFormField(
            controller: _passCtrl,
            obscureText: _obscurePass,
            decoration: InputDecoration(
              labelText: 'Mật khẩu *',
              prefixIcon: const Icon(Icons.lock_outline),
              suffixIcon: IconButton(
                icon: Icon(
                  _obscurePass
                      ? Icons.visibility_off_outlined
                      : Icons.visibility_outlined,
                ),
                onPressed: () => setState(() => _obscurePass = !_obscurePass),
              ),
            ),
            validator: (v) {
              if (v == null || v.isEmpty) return 'Nhập mật khẩu';
              if (v.length < 6) return 'Ít nhất 6 ký tự';
              return null;
            },
          ),
          const SizedBox(height: 12),
          // Giới tính
          DropdownButtonFormField<String>(
            value: _gender,
            decoration: const InputDecoration(
              labelText: 'Giới tính',
              prefixIcon: Icon(Icons.wc_outlined),
            ),
            items: const [
              DropdownMenuItem(value: 'MALE', child: Text('Nam')),
              DropdownMenuItem(value: 'FEMALE', child: Text('Nữ')),
              DropdownMenuItem(value: 'OTHER', child: Text('Khác')),
            ],
            onChanged: (v) => setState(() => _gender = v ?? 'MALE'),
          ),
          const SizedBox(height: 12),
          // Ngày sinh (optional)
          TextFormField(
            controller: _dobCtrl,
            readOnly: true,
            decoration: const InputDecoration(
              labelText: 'Ngày sinh (tùy chọn)',
              prefixIcon: Icon(Icons.calendar_today_outlined),
              hintText: 'YYYY-MM-DD',
            ),
            onTap: () async {
              final picked = await showDatePicker(
                context: context,
                initialDate: DateTime(2000),
                firstDate: DateTime(1940),
                lastDate: DateTime.now(),
              );
              if (picked != null) {
                _dobCtrl.text =
                    '${picked.year}-${picked.month.toString().padLeft(2, '0')}-${picked.day.toString().padLeft(2, '0')}';
              }
            },
          ),
          const SizedBox(height: 12),
          // Địa chỉ (optional)
          TextFormField(
            controller: _addressCtrl,
            decoration: const InputDecoration(
              labelText: 'Địa chỉ (tùy chọn)',
              prefixIcon: Icon(Icons.location_on_outlined),
            ),
          ),
          const SizedBox(height: 24),
          FilledButton(
            onPressed: _loading ? null : _register,
            style: FilledButton.styleFrom(
              backgroundColor: AppColors.primary,
              padding: const EdgeInsets.symmetric(vertical: 14),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(10),
              ),
            ),
            child: _loading
                ? const SizedBox(
                    height: 20,
                    width: 20,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      color: Colors.white,
                    ),
                  )
                : const Text(
                    'Hoàn tất đăng ký',
                    style: TextStyle(fontSize: 16),
                  ),
          ),
        ],
      ),
    );
  }
}
