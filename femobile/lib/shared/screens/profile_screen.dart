import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../../core/providers/auth_provider.dart';
import '../../core/services/shared_service.dart';
import '../../core/constants/app_colors.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  final SharedService _sharedService = SharedService();
  bool _isLoading = true;
  Map<String, dynamic>? _profile;

  @override
  void initState() {
    super.initState();

    _fetchProfile();
  }

  Future<void> _fetchProfile() async {
    try {
      final data = await _sharedService.getMyProfile();

      if (mounted) {
        setState(() {
          _profile = data;
          _isLoading = false;
        });
      }
    } catch (_) {
      // Fallback: vẫn hiện màn hình với info từ JWT, không crash
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  // ── Helpers ──

  String _genderLabel(String? gender) {
    switch (gender) {
      case 'MALE':
        return 'Nam';
      case 'FEMALE':
        return 'Nữ';
      case 'OTHER':
        return 'Khác';
      default:
        return '—';
    }
  }

  String _formatDate(String? isoDate) {
    if (isoDate == null || isoDate.isEmpty) return '—';
    try {
      final date = DateTime.parse(isoDate);

      return '${date.day.toString().padLeft(2, '0')}/${date.month.toString().padLeft(2, '0')}/${date.year}';
    } catch (_) {
      return isoDate;
    }
  }

  // ── Build ──

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();

    return Scaffold(
      backgroundColor: AppColors.backgroundBody,
      appBar: AppBar(
        title: const Text('Tài khoản'),
        backgroundColor: Colors.white,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            tooltip: 'Làm mới',
            onPressed: () {
              setState(() => _isLoading = true);
              _fetchProfile();
            },
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _fetchProfile,
              child: ListView(
                padding: const EdgeInsets.all(16),
                children: [
                  // ── Avatar Card ──
                  _buildAvatarCard(auth),
                  const SizedBox(height: 16),

                  // ── Thông tin cơ bản ──
                  _buildSectionTitle('Thông tin cơ bản'),
                  const SizedBox(height: 8),
                  _buildInfoCard(auth),
                  const SizedBox(height: 16),

                  // ── Thông tin chuyên môn (Bác sĩ) ──
                  if (auth.isDoctor) ...[
                    _buildSectionTitle('Thông tin chuyên môn'),
                    const SizedBox(height: 8),
                    _buildDoctorCard(),
                    const SizedBox(height: 16),
                  ],

                  // ── Menu items ──
                  _buildSectionTitle('Cài đặt'),
                  const SizedBox(height: 8),
                  _MenuItem(
                    icon: Icons.notifications_outlined,
                    label: 'Thông báo',
                    onTap: () => context.push(
                      auth.isPatient
                          ? '/patient/profile/notifications'
                          : '/doctor/profile/notifications',
                    ),
                  ),
                  _MenuItem(
                    icon: Icons.feedback_outlined,
                    label: 'Gửi góp ý',
                    onTap: () => context.push(
                      auth.isPatient
                          ? '/patient/feedback'
                          : '/doctor/profile/feedback',
                    ),
                  ),
                  const SizedBox(height: 8),
                  const Divider(),
                  const SizedBox(height: 8),

                  // ── Đăng xuất ──
                  _MenuItem(
                    icon: Icons.logout,
                    label: 'Đăng xuất',
                    iconColor: AppColors.danger,
                    textColor: AppColors.danger,
                    onTap: () async {
                      final confirm = await showDialog<bool>(
                        context: context,
                        builder: (ctx) => AlertDialog(
                          title: const Text('Đăng xuất'),
                          content: const Text(
                            'Bạn có chắc muốn đăng xuất không?',
                          ),
                          actions: [
                            TextButton(
                              onPressed: () => Navigator.pop(ctx, false),
                              child: const Text('Hủy'),
                            ),
                            FilledButton(
                              onPressed: () => Navigator.pop(ctx, true),
                              style: FilledButton.styleFrom(
                                backgroundColor: AppColors.danger,
                              ),
                              child: const Text('Đăng xuất'),
                            ),
                          ],
                        ),
                      );
                      if (confirm == true && context.mounted) {
                        await context.read<AuthProvider>().logout();
                      }
                    },
                  ),
                ],
              ),
            ),
    );
  }

  // ── Avatar Card ──
  Widget _buildAvatarCard(AuthProvider auth) {
    final displayName =
        _profile?['fullName'] as String? ?? auth.fullName ?? 'Người dùng';
    final displayEmail = _profile?['email'] as String? ?? auth.email ?? '';
    final isDoctor = auth.isDoctor;

    return Card(
      elevation: 0,
      color: Colors.white,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(color: AppColors.border),
      ),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Row(
          children: [
            CircleAvatar(
              radius: 36,
              backgroundColor: AppColors.primaryLight,
              child: Text(
                displayName[0].toUpperCase(),
                style: const TextStyle(
                  fontSize: 30,
                  fontWeight: FontWeight.bold,
                  color: AppColors.primary,
                ),
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    displayName,
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: AppColors.textHeading,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    displayEmail,
                    style: const TextStyle(
                      color: AppColors.textMuted,
                      fontSize: 13,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 10,
                      vertical: 3,
                    ),
                    decoration: BoxDecoration(
                      color: AppColors.primaryLight,
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      isDoctor ? 'Bác sĩ' : 'Bệnh nhân',
                      style: const TextStyle(
                        color: AppColors.primary,
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ── Info Card (thông tin cơ bản) ──
  Widget _buildInfoCard(AuthProvider auth) {
    final phone = _profile?['phone'] as String?;
    final gender = _genderLabel(_profile?['gender'] as String?);
    final dob = _formatDate(_profile?['dob'] as String?);
    final address = _profile?['address'] as String?;

    return Card(
      elevation: 0,
      color: Colors.white,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(color: AppColors.border),
      ),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
        child: Column(
          children: [
            _buildInfoRow(Icons.phone_outlined, 'Số điện thoại', phone ?? '—'),
            const Divider(height: 24),
            _buildInfoRow(Icons.person_outline, 'Giới tính', gender),
            const Divider(height: 24),
            _buildInfoRow(Icons.cake_outlined, 'Ngày sinh', dob),
            const Divider(height: 24),
            _buildInfoRow(
              Icons.location_on_outlined,
              'Địa chỉ',
              address ?? '—',
            ),
          ],
        ),
      ),
    );
  }

  // ── Doctor Card (thông tin chuyên môn) ──
  Widget _buildDoctorCard() {
    final specialtyName = _profile?['specialtyName'] as String?;
    final degreeName = _profile?['degreeName'] as String?;
    final experienceYears = _profile?['experienceYears'];
    final biography = _profile?['biography'] as String?;

    return Card(
      elevation: 0,
      color: Colors.white,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(color: AppColors.border),
      ),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
        child: Column(
          children: [
            _buildInfoRow(
              Icons.local_hospital_outlined,
              'Chuyên khoa',
              specialtyName ?? '—',
            ),
            const Divider(height: 24),
            _buildInfoRow(Icons.school_outlined, 'Bằng cấp', degreeName ?? '—'),
            const Divider(height: 24),
            _buildInfoRow(
              Icons.timer_outlined,
              'Kinh nghiệm',
              experienceYears != null ? '$experienceYears năm' : '—',
            ),
            if (biography != null && biography.isNotEmpty) ...[
              const Divider(height: 24),
              _buildBiographyRow(biography),
            ],
          ],
        ),
      ),
    );
  }

  // ── Row đơn ──
  Widget _buildInfoRow(IconData icon, String label, String value) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, size: 20, color: AppColors.primary),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: const TextStyle(
                  fontSize: 12,
                  color: AppColors.textMuted,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                value,
                style: const TextStyle(
                  fontSize: 15,
                  color: AppColors.textHeading,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  // ── Biography Row (multiline) ──
  Widget _buildBiographyRow(String biography) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Icon(Icons.notes_outlined, size: 20, color: AppColors.primary),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Tiểu sử',
                style: TextStyle(fontSize: 12, color: AppColors.textMuted),
              ),
              const SizedBox(height: 2),
              Text(
                biography,
                style: const TextStyle(
                  fontSize: 14,
                  color: AppColors.textBody,
                  height: 1.5,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  // ── Section title ──
  Widget _buildSectionTitle(String title) {
    return Padding(
      padding: const EdgeInsets.only(left: 4, bottom: 2),
      child: Text(
        title,
        style: const TextStyle(
          fontSize: 13,
          fontWeight: FontWeight.w600,
          color: AppColors.textMuted,
          letterSpacing: 0.5,
        ),
      ),
    );
  }
}

// ── MenuItem Widget ──
class _MenuItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;
  final Color iconColor;
  final Color textColor;

  const _MenuItem({
    required this.icon,
    required this.label,
    required this.onTap,
    this.iconColor = AppColors.textBody,
    this.textColor = AppColors.textBody,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 0,
      color: Colors.white,
      margin: const EdgeInsets.only(bottom: 8),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(color: AppColors.border),
      ),
      child: ListTile(
        leading: Icon(icon, color: iconColor),
        title: Text(
          label,
          style: TextStyle(color: textColor, fontWeight: FontWeight.w500),
        ),
        trailing: Icon(Icons.chevron_right, color: AppColors.textMuted),
        onTap: onTap,
      ),
    );
  }
}
