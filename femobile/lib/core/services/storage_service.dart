import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../constants/app_constants.dart';

class StorageService {
  static FlutterSecureStorage? _storage;

  static Future<void> init() async {
    _storage = FlutterSecureStorage();
  }

  static Future<void> saveTokens({
    required String accessToken,
    required String refreshToken,
  }) async {
    await _storage?.write(key: AppConstants.keyAccessToken, value: accessToken);

    await _storage?.write(
      key: AppConstants.keyRefreshToken,
      value: refreshToken,
    );
  }

  static Future<String?> getAccessToken() async {
    return await _storage?.read(key: AppConstants.keyAccessToken);
  }

  static Future<String?> getRefreshToken() async {
    return await _storage?.read(key: AppConstants.keyRefreshToken);
  }

  static Future<void> saveUserInfo({
    required int userId,
    required int roleId,
    required String email,
    String? fullName,
  }) async {
    await _storage?.write(
      key: AppConstants.keyUserId,
      value: userId.toString(),
    );

    await _storage?.write(
      key: AppConstants.keyRoleId,
      value: roleId.toString(),
    );

    await _storage?.write(key: AppConstants.keyUserEmail, value: email);

    if (fullName != null) {
      await _storage?.write(key: AppConstants.keyUserName, value: fullName);
    }
  }

  static Future<int?> getUserId() async {
    String? strData = await _storage?.read(key: AppConstants.keyUserId);

    return strData != null ? int.tryParse(strData) : null;
  }

  static Future<int?> getRoleId() async {
    String? strData = await _storage?.read(key: AppConstants.keyRoleId);

    return strData != null ? int.tryParse(strData) : null;
  }

  static Future<String?> getEmail() async {
    return await _storage?.read(key: AppConstants.keyUserEmail);
  }

  static Future<String?> getFullName() async {
    return await _storage?.read(key: AppConstants.keyUserName);
  }

  static Future<void> clear() async {
    await _storage?.deleteAll();
  }
}
