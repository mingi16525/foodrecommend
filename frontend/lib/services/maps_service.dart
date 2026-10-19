import 'dart:io';
import 'dart:math' as math;
import 'package:flutter/foundation.dart';
import 'package:url_launcher/url_launcher.dart';

class MapsService {
  /// Mở bản đồ dẫn đường (Google Maps hoặc Apple Maps) đến một tọa độ và địa chỉ thực tế
  static Future<bool> openMapsDirection(
    double lat,
    double lng,
    String label, {
    String? address,
  }) async {
    final destinationQuery = address != null && address.trim().isNotEmpty
        ? '$label, $address'
        : label;
    final encodedQuery = Uri.encodeComponent(destinationQuery);

    try {
      if (kIsWeb) {
        final webUrl = Uri.parse('https://www.google.com/maps/dir/?api=1&destination=$lat,$lng');
        return await launchUrl(webUrl, mode: LaunchMode.externalApplication);
      }

      if (Platform.isIOS) {
        final appleMapsUrl = Uri.parse('https://maps.apple.com/?daddr=$lat,$lng&q=$encodedQuery');
        if (await canLaunchUrl(appleMapsUrl)) {
          return await launchUrl(appleMapsUrl, mode: LaunchMode.externalApplication);
        }
        final googleMapsIosUrl = Uri.parse('comgooglemaps://?daddr=$lat,$lng&directionsmode=driving');
        if (await canLaunchUrl(googleMapsIosUrl)) {
          return await launchUrl(googleMapsIosUrl, mode: LaunchMode.externalApplication);
        }
      } else {
        // Android: Thử google.navigation trước, sau đó fallback sang geo:, và google.com/maps
        final navUri = Uri.parse('google.navigation:q=$lat,$lng&mode=d');
        if (await canLaunchUrl(navUri)) {
          final launched = await launchUrl(navUri, mode: LaunchMode.externalApplication);
          if (launched) return true;
        }

        final geoUri = Uri.parse('geo:$lat,$lng?q=$lat,$lng($encodedQuery)');
        if (await canLaunchUrl(geoUri)) {
          final launched = await launchUrl(geoUri, mode: LaunchMode.externalApplication);
          if (launched) return true;
        }
      }

      // Fallback chung cho cả Android/iOS/Desktop: Google Maps Web Direction
      final webDirUrl = Uri.parse('https://www.google.com/maps/dir/?api=1&destination=$lat,$lng');
      if (await canLaunchUrl(webDirUrl)) {
        return await launchUrl(webDirUrl, mode: LaunchMode.externalApplication);
      }

      // Fallback cuối: Google Maps Search với tên quán & địa chỉ
      final webSearchUrl = Uri.parse('https://www.google.com/maps/search/?api=1&query=$encodedQuery');
      return await launchUrl(webSearchUrl, mode: LaunchMode.externalApplication);
    } catch (e) {
      assert(() {
        debugPrint('Lỗi khi mở bản đồ: $e');
        return true;
      }());
      return false;
    }
  }

  /// Khởi tạo Google Maps SDK (Cần API Key)
  static void initializeMapsSdk(String apiKey) {
    assert(() {
      debugPrint('Đã khởi tạo Google Maps SDK với key: $apiKey');
      return true;
    }());
  }

  /// Tính toán khoảng cách Haversine giữa 2 điểm theo kilomet.
  static double calculateDistance(double startLat, double startLng, double endLat, double endLng) {
    const earthRadiusKm = 6371.0;
    final dLat = _radians(endLat - startLat);
    final dLng = _radians(endLng - startLng);
    final startLatRadians = _radians(startLat);
    final endLatRadians = _radians(endLat);
    final a = math.pow(math.sin(dLat / 2), 2) +
        math.cos(startLatRadians) * math.cos(endLatRadians) * math.pow(math.sin(dLng / 2), 2);
    final clamped = a.clamp(0.0, 1.0);
    return earthRadiusKm * 2 * math.atan2(math.sqrt(clamped), math.sqrt(1 - clamped));
  }

  static double _radians(double degrees) => degrees * math.pi / 180;
}
