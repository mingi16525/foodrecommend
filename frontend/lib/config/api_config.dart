import 'dart:convert';
import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';

class ApiConfig {
  /// URL chứa cấu hình động từ GitHub repository (tự động cập nhật mỗi khi chạy tunnel)
  static const String remoteConfigUrl = 'https://raw.githubusercontent.com/mingi16525/foodrecommend/main/ACTIVE_TUNNEL_URL.txt';

  /// Base URL mặc định dự phòng
  static const String defaultTunnelUrl = 'https://suggesting-fruit-pets-exhibits.trycloudflare.com';
  static const String defaultEmulatorUrl = 'http://10.0.2.2:3000';
  static const String defaultLanUrl = 'http://192.168.1.89:3000';

  /// Base URL đang hoạt động trong app
  static String baseUrl = defaultTunnelUrl;
  
  /// Global auth token
  static String? token;

  /// Tự động lấy URL mới nhất từ GitHub hoặc SharedPreferences khi khởi động app
  static Future<void> init() async {
    // 1. Kiểm tra nếu người dùng đã tự tay cấu hình một URL riêng trong app
    try {
      final prefs = await SharedPreferences.getInstance();
      final customUrl = prefs.getString('custom_base_url');
      if (customUrl != null && customUrl.trim().isNotEmpty) {
        baseUrl = customUrl.trim();
        debugPrint('[ApiConfig] Sử dụng custom URL từ máy: $baseUrl');
        return;
      }
    } catch (_) {}

    // 2. Tự động tải URL động mới nhất từ GitHub Remote Config
    try {
      final client = HttpClient();
      client.badCertificateCallback = (cert, host, port) => true;
      client.connectionTimeout = const Duration(seconds: 3);
      final req = await client.getUrl(Uri.parse(remoteConfigUrl));
      final res = await req.close();
      if (res.statusCode == 200) {
        final body = await res.transform(utf8.decoder).join();
        final trimmed = body.trim();
        if (trimmed.startsWith('https://') || trimmed.startsWith('http://')) {
          baseUrl = trimmed;
          debugPrint('[ApiConfig] Đã tự động cập nhật URL từ GitHub: $baseUrl');
          return;
        }
      }
    } catch (e) {
      debugPrint('[ApiConfig] Không thể tải remote config, dùng mặc định: $e');
    }

    // 3. Dự phòng dùng defaultTunnelUrl
    baseUrl = defaultTunnelUrl;
  }

  /// Cập nhật và lưu baseUrl mới thủ công
  static Future<void> setBaseUrl(String url) async {
    baseUrl = url.trim();
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('custom_base_url', baseUrl);
    } catch (_) {}
  }

  /// Xóa URL thủ công để quay lại tự động đồng bộ theo GitHub
  static Future<void> resetToAutoSync() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove('custom_base_url');
      await init();
    } catch (_) {}
  }
}
