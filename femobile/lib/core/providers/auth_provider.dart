import 'package:dart_jsonwebtoken/dart_jsonwebtoken.dart';
import 'package:flutter/foundation.dart';
import '../services/auth_service.dart';
import '../services/storage_service.dart';

/// Trạng thái xác thực
enum AuthStatus { unknown, authenticated, unauthenticated }

/// AuthProvider quản lý state đăng nhập toàn cục:
/// - Trạng thái auth (unknown → check token → authenticated/unauthenticated)
/// - Thông tin user hiện tại (userId, roleId, email, fullName)
/// - Các action: login, logout, register, forgotPassword
class AuthProvider extends ChangeNotifier {
  final AuthService _authService = AuthService();
  AuthStatus _status = AuthStatus.unknown;

  AuthStatus get status {
    return _status;
  }

  int? _userId;
  int? _roleId;
  String? _email;
  String? _fullName;

  int? get userId {
    return _userId;
  }

  int? get roleId {
    return _roleId;
  }

  String? get email {
    return _email;
  }

  String? get fullName {
    return _fullName;
  }

  bool get isDoctor {
    return _roleId == 2;
  }

  bool get isPatient {
    return _roleId == 3;
  }

  /// Gọi khi app khởi động: đọc token để restore session
  Future<void> tryRestoreSession() async {
    final token = await StorageService.getAccessToken();

    if (token == null) {
      _status = AuthStatus.unauthenticated;

      notifyListeners();

      return;
    }

    _userId = await StorageService.getUserId();
    _roleId = await StorageService.getRoleId();
    _email = await StorageService.getEmail();
    _fullName = await StorageService.getFullName();
    _status = AuthStatus.authenticated;

    notifyListeners();
  }

  /// Đăng nhập
  Future<void> login(String email, String password) async {
    final data = await _authService.login(email: email, password: password);

    final accessToken = data['accessToken'] as String;
    final refreshToken = data['refreshToken'] as String;

    await StorageService.saveTokens(
      accessToken: accessToken,
      refreshToken: refreshToken,
    );

    // Decode JWT để lấy userId + roleId (không verify, chỉ read payload)
    final jwt = JWT.decode(accessToken);
    final payload = jwt.payload as Map<String, dynamic>;
    final userId = payload['userId'] as int;
    final roleId = payload['roleId'] as int;

    await StorageService.saveUserInfo(
      userId: userId,
      roleId: roleId,
      email: email,
    );

    _userId = userId;
    _roleId = roleId;
    _email = email;
    _status = AuthStatus.authenticated;

    notifyListeners();
  }

  /// Đăng xuất
  Future<void> logout() async {
    await _authService.logout();

    _userId = null;
    _roleId = null;
    _email = null;
    _fullName = null;
    _status = AuthStatus.unauthenticated;

    notifyListeners();
  }

  /// Cập nhật displayName sau khi fetch profile (dùng bởi Home screen)
  void setFullName(String name) {
    _fullName = name;

    StorageService.saveUserInfo(
      userId: _userId!,
      roleId: _roleId!,
      email: _email!,
      fullName: name,
    );

    notifyListeners();
  }
}
