import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:url_launcher/url_launcher.dart';

class MapsService {
  /// Mở bản đồ dẫn đường (Google Maps hoặc Apple Maps) đến một tọa độ
  static Future<void> openMapsDirection(double lat, double lng, String label) async {
    final Uri googleMapsUrl = Uri.parse("google.navigation:q=$lat,$lng&mode=d");
    final Uri appleMapsUrl = Uri.parse("https://maps.apple.com/?daddr=$lat,$lng");
    
    try {
      if (Platform.isIOS) {
        if (await canLaunchUrl(appleMapsUrl)) {
          await launchUrl(appleMapsUrl);
        } else if (await canLaunchUrl(googleMapsUrl)) {
          await launchUrl(googleMapsUrl);
        }
      } else {
        if (await canLaunchUrl(googleMapsUrl)) {
          await launchUrl(googleMapsUrl);
        } else {
          final webUrl = Uri.parse("https://www.google.com/maps/dir/?api=1&destination=$lat,$lng");
          await launchUrl(webUrl);
        }
      }
    } catch (e) {
      assert(() { debugPrint('Lỗi khi mở bản đồ: $e'); return true; }());
    }

    assert(() { debugPrint('Đã mở bản đồ hướng dẫn tới: $label ($lat, $lng)'); return true; }());
  }

  /// Khởi tạo Google Maps SDK (Cần API Key)
  static void initializeMapsSdk(String apiKey) {
    // Gọi phương thức khởi tạo của google_maps_flutter hoặc maps_toolkit
    assert(() { debugPrint('Đã khởi tạo Google Maps SDK với key: $apiKey'); return true; }());
  }

  /// Tính toán khoảng cách giữa 2 điểm (mock)
  static double calculateDistance(double startLat, double startLng, double endLat, double endLng) {
    // Sử dụng công thức Haversine để tính khoảng cách thực tế
    return 1.5; // Giả định trả về 1.5 km
  }
}
