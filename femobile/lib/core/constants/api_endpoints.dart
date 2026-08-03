class ApiEndpoints {
  // === Auth ===
  static const String getRegisterOtp = '/users/get-register-otp';
  static const String register = '/users/register';
  static const String login = '/users/login';
  static const String refresh = '/users/refresh';
  static const String logout = '/users/logout';
  static const String getForgotOtp = '/users/get-forgot-password-otp';
  static const String forgotPassword = '/users/forgot-password';

  // === Catalogs ===
  static const String specialties = '/catalogs/specialties';

  // === Schedule ===
  static const String openingTime = '/opening-time';
  static const String timeSlotsAvailable = '/time-slots/available';
  static const String templates = '/templates';

  // === Bookings ===
  static const String bookings = '/bookings';

  static String bookingById(int id) {
    return '/bookings/$id';
  }

  static String cancelBooking(int id) {
    return '/bookings/cancel/$id';
  }

  static String finishBooking(int id) {
    return '/bookings/finish/$id';
  }

  static String noShowBooking(int id) {
    return '/bookings/no-show/$id';
  }

  static String videoCallToken(int id) {
    return '/bookings/video-call/$id';
  }

  // === Medical Records ===
  static const String myRecords = '/records';

  static String recordsByPatient(int patientId) {
    return '/records/patient/$patientId';
  }

  static String recordByBooking(int bookingId) {
    return '/records/booking/$bookingId';
  }

  // === Invoices & Payment ===
  static String invoiceById(int id) {
    return '/invoices/$id';
  }

  static String createPaymentUrl(int invoiceId) {
    return '/vnpay/$invoiceId';
  }

  // === Diseases ===
  static const String diseases = '/diseases';

  // === Medicines ===
  static const String medicines = '/medicines';

  // === Leaves ===
  static const String leaves = '/leaves';

  // === Change Requests ===
  static const String changeRequests = '/change-requests';

  static String changeRequestById(int id) {
    return '/change-requests/$id';
  }

  // === Feedbacks ===
  static const String feedbacks = '/feedbacks';

  // === Notifications ===
  static const String notifications = '/notification';
}
