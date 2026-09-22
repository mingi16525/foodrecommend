class ApiConfig {
  /// Base URL cho toàn bộ các API endpoint trong ứng dụng.
  /// Thay đổi URL này khi switch giữa localhost, devtunnels, hoặc production.
  static const String baseUrl = 'https://xcvm1t13-3000.asse.devtunnels.ms';
  
  /// Global auth token
  static String? token;
}
