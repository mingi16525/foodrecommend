class ApiConfig {
  /// Base URL cho toàn bộ các API endpoint trong ứng dụng.
  /// Thay đổi URL này khi switch giữa localhost, devtunnels, hoặc production.
  static const String baseUrl = 'https://6xmlqd1k-3000.asse.devtunnels.ms';
  
  /// Global auth token for MVP testing
  static String? token = 'mock.jwt.token';
}
