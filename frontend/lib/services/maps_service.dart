import 'dart:io';

class MapsService {
  /// Mở bản đồ dẫn đường (Google Maps hoặc Apple Maps) đến một tọa độ
  static Future<void> openMapsDirection(double lat, double lng, String label) async {
    // Trong môi trường thực tế sẽ dùng url_launcher
    // final Uri googleMapsUrl = Uri.parse("google.navigation:q=$lat,$lng&mode=d");
    // final Uri appleMapsUrl = Uri.parse("https://maps.apple.com/?daddr=$lat,$lng");
    
    // if (Platform.isIOS) {
    //   if (await canLaunchUrl(appleMapsUrl)) {
    //     await launchUrl(appleMapsUrl);
    //   }
    // } else {
    //   if (await canLaunchUrl(googleMapsUrl)) {
    //     await launchUrl(googleMapsUrl);
    //   }
    // }
    
    print('Giả lập mở bản đồ hướng dẫn tới: $label ($lat, $lng)');
  }

  /// Khởi tạo Google Maps SDK (Cần API Key)
  static void initializeMapsSdk(String apiKey) {
    // Gọi phương thức khởi tạo của google_maps_flutter hoặc maps_toolkit
    print('Đã khởi tạo Google Maps SDK với key: $apiKey');
  }

  /// Tính toán khoảng cách giữa 2 điểm (mock)
  static double calculateDistance(double startLat, double startLng, double endLat, double endLng) {
    // Sử dụng công thức Haversine để tính khoảng cách thực tế
    return 1.5; // Giả định trả về 1.5 km
  }
}
