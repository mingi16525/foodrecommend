class ApiConfig {
  /// Base URL cho toàn bộ các API endpoint trong ứng dụng.
  /// URL Cloudflare Tunnel công khai kết nối trực tiếp tới Backend local port 3000.
  static const String baseUrl = 'https://doctor-screenshot-apparently-editing.trycloudflare.com';
  
  /// Global auth token
  static String? token;
}
