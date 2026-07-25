import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../core/providers/auth_provider.dart';

// === Auth Screens ===
import '../auth/screens/login_screen.dart';
import '../auth/screens/register_screen.dart';
import '../auth/screens/forgot_password_screen.dart';

// === Shared Screens ===
import '../shared/screens/splash_screen.dart';
import '../shared/screens/notification_screen.dart';
import '../shared/screens/profile_screen.dart';

// === Patient Screens ===
import '../patient/screens/patient_shell.dart';
import '../patient/screens/patient_home_screen.dart';
import '../patient/screens/booking_flow_screen.dart';
import '../patient/screens/booking_list_screen.dart';
import '../patient/screens/booking_detail_screen.dart';
import '../patient/screens/medical_history_screen.dart';
import '../patient/screens/medical_record_detail_screen.dart';
import '../patient/screens/invoice_detail_screen.dart';
import '../patient/screens/feedback_screen.dart';

// === Doctor Screens ===
import '../doctor/screens/doctor_shell.dart';
import '../doctor/screens/doctor_home_screen.dart';
import '../doctor/screens/doctor_booking_detail_screen.dart';
import '../doctor/screens/examination_screen.dart';
import '../doctor/screens/patient_records_screen.dart';
import '../doctor/screens/leave_request_screen.dart';
import '../doctor/screens/change_request_screen.dart';

final _rootNavigatorKey = GlobalKey<NavigatorState>();

GoRouter createRouter(AuthProvider authProvider) {
  return GoRouter(
    navigatorKey: _rootNavigatorKey,
    initialLocation: '/splash',
    refreshListenable: authProvider,
    redirect: (context, state) {
      final status = authProvider.status;
      final path = state.uri.path;

      // Đang chờ khởi động → về splash
      if (status == AuthStatus.unknown) {
        return path == '/splash' ? null : '/splash';
      }

      // Chưa auth → chỉ cho phép đến auth pages
      final authPaths = ['/login', '/register', '/forgot-password', '/splash'];

      if (status == AuthStatus.unauthenticated) {
        return authPaths.contains(path) ? null : '/login';
      }

      // Đã auth → không cho vào auth pages
      if (authPaths.contains(path)) {
        return authProvider.isDoctor ? '/doctor' : '/patient';
      }

      // Đã auth nhưng sai role
      if (path.startsWith('/patient') && authProvider.isDoctor) {
        return '/doctor';
      }
      if (path.startsWith('/doctor') && authProvider.isPatient) {
        return '/patient';
      }

      return null;
    },
    routes: [
      // Splash
      GoRoute(path: '/splash', builder: (_, __) => const SplashScreen()),

      // === Auth Routes ===
      GoRoute(path: '/login', builder: (_, __) => const LoginScreen()),
      GoRoute(path: '/register', builder: (_, __) => const RegisterScreen()),
      GoRoute(
        path: '/forgot-password',
        builder: (_, __) => const ForgotPasswordScreen(),
      ),

      // === Patient Shell ===
      StatefulShellRoute.indexedStack(
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state, navigationShell) =>
            PatientShell(navigationShell: navigationShell),
        branches: [
          // Tab 0: Trang chủ
          StatefulShellBranch(
            navigatorKey: GlobalKey<NavigatorState>(),
            routes: [
              GoRoute(
                path: '/patient',
                builder: (_, __) => const PatientHomeScreen(),
                routes: [
                  GoRoute(
                    path: 'book',
                    builder: (_, __) => const BookingFlowScreen(),
                  ),
                  GoRoute(
                    path: 'invoice/:id',
                    builder: (_, state) => InvoiceDetailScreen(
                      invoiceId: int.parse(state.pathParameters['id']!),
                    ),
                  ),
                  GoRoute(
                    path: 'feedback',
                    builder: (_, __) => const FeedbackScreen(),
                  ),
                ],
              ),
            ],
          ),
          // Tab 1: Lịch hẹn
          StatefulShellBranch(
            navigatorKey: GlobalKey<NavigatorState>(),
            routes: [
              GoRoute(
                path: '/patient/bookings',
                builder: (_, __) => const BookingListScreen(),
                routes: [
                  GoRoute(
                    path: ':id',
                    builder: (_, state) => BookingDetailScreen(
                      bookingId: int.parse(state.pathParameters['id']!),
                    ),
                  ),
                ],
              ),
            ],
          ),
          // Tab 2: Hồ sơ y tế
          StatefulShellBranch(
            navigatorKey: GlobalKey<NavigatorState>(),
            routes: [
              GoRoute(
                path: '/patient/records',
                builder: (_, __) => const MedicalHistoryScreen(),
                routes: [
                  GoRoute(
                    path: ':bookingId',
                    builder: (_, state) => MedicalRecordDetailScreen(
                      bookingId: int.parse(state.pathParameters['bookingId']!),
                    ),
                  ),
                ],
              ),
            ],
          ),
          // Tab 3: Tài khoản
          StatefulShellBranch(
            navigatorKey: GlobalKey<NavigatorState>(),
            routes: [
              GoRoute(
                path: '/patient/profile',
                builder: (_, __) => const ProfileScreen(),
                routes: [
                  GoRoute(
                    path: 'notifications',
                    builder: (_, __) => const NotificationScreen(),
                  ),
                ],
              ),
            ],
          ),
        ],
      ),

      // === Doctor Shell ===
      StatefulShellRoute.indexedStack(
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state, navigationShell) =>
            DoctorShell(navigationShell: navigationShell),
        branches: [
          // Tab 0: Trang chủ
          StatefulShellBranch(
            navigatorKey: GlobalKey<NavigatorState>(),
            routes: [
              GoRoute(
                path: '/doctor',
                builder: (_, __) => const DoctorHomeScreen(),
                routes: [
                  GoRoute(
                    path: 'bookings/:id',
                    builder: (_, state) => DoctorBookingDetailScreen(
                      bookingId: int.parse(state.pathParameters['id']!),
                    ),
                    routes: [
                      GoRoute(
                        path: 'examine',
                        builder: (_, state) => ExaminationScreen(
                          bookingId: int.parse(state.pathParameters['id']!),
                        ),
                      ),
                    ],
                  ),
                  GoRoute(
                    path: 'patient-records/:patientId',
                    builder: (_, state) => PatientRecordsScreen(
                      patientId: int.parse(state.pathParameters['patientId']!),
                    ),
                  ),
                ],
              ),
            ],
          ),
          // Tab 1: Đơn từ (Nghỉ phép + Đổi lịch)
          StatefulShellBranch(
            navigatorKey: GlobalKey<NavigatorState>(),
            routes: [
              GoRoute(
                path: '/doctor/leaves',
                builder: (_, __) => const LeaveRequestScreen(),
              ),
              GoRoute(
                path: '/doctor/change-requests',
                builder: (_, __) => const ChangeRequestScreen(),
              ),
            ],
          ),
          // Tab 2: Thông báo
          StatefulShellBranch(
            navigatorKey: GlobalKey<NavigatorState>(),
            routes: [
              GoRoute(
                path: '/doctor/notifications',
                builder: (_, __) => const NotificationScreen(),
              ),
            ],
          ),
          // Tab 3: Tài khoản
          StatefulShellBranch(
            navigatorKey: GlobalKey<NavigatorState>(),
            routes: [
              GoRoute(
                path: '/doctor/profile',
                builder: (_, __) => const ProfileScreen(),
              ),
            ],
          ),
        ],
      ),
    ],
  );
}
