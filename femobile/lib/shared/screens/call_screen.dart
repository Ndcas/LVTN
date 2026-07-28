import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:provider/provider.dart';
import 'package:zego_uikit_prebuilt_call/zego_uikit_prebuilt_call.dart';
import '../../core/providers/auth_provider.dart';

class CallScreen extends StatelessWidget {
  final String callId;

  const CallScreen({super.key, required this.callId});

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();

    return ZegoUIKitPrebuiltCall(
      appID: dotenv.getInt('ZEGOCLOUD_APP_ID'),
      appSign: dotenv.get('ZEGOCLOUD_APP_SIGN'),
      userID: auth.userId?.toString() ?? 'unknown_user',
      userName: auth.fullName ?? auth.email ?? 'Người dùng',
      callID: callId,
      config: ZegoUIKitPrebuiltCallConfig.oneOnOneVideoCall(),
    );
  }
}
