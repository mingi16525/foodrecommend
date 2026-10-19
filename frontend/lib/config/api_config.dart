import 'package:shared_preferences/shared_preferences.dart';

class ApiConfig {
  /// Base URL mặc định (Cloudflare Tunnel công khai)
  static const String defaultTunnelUrl = 'https://doctor-screenshot-apparently-editing.trycloudflare.com';
  static const String defaultEmulatorUrl = 'http://10.0.2.2:3000';
  static const String defaultLanUrl = 'http://192.168.1.89:3000';

  /// Base URL động đang được ứng dụng sử dụng
  static String baseUrl = defaultTunnelUrl;
  
  /// Global auth token
  static String? token;

  /// Load baseUrl đã lưu từ SharedPreferences (nếu có)
  static Future<void> init() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final savedUrl = prefs.getString('custom_base_url');
      if (savedUrl != null && savedUrl.trim().isNotEmpty) {
        baseUrl = savedUrl.trim();
      }
    } catch (_) {}
  }

  /// Cập nhật và lưu baseUrl mới
  static Future<void> setBaseUrl(String url) async {
    baseUrl = url.trim();
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('custom_base_url', baseUrl);
    } catch (_) {}
  }
}
