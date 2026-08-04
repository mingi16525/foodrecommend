import 'package:url_launcher/url_launcher.dart';

class DeliveryLinkService {
  /// Mở ứng dụng GrabFood với từ khóa quán ăn
  static Future<void> openGrabFood(String restaurantName) async {
    final query = Uri.encodeComponent(restaurantName);
    final url = "grab://open?screenType=GRABFOOD&searchQuery=$query";
    
    try {
      if (await canLaunchUrl(Uri.parse(url))) {
        await launchUrl(Uri.parse(url));
      } else {
        await launchUrl(Uri.parse("https://food.grab.com/vn/vi/restaurants?search=$query"));
      }
    } catch (e) {
      print('Lỗi mở GrabFood: $e');
    }
    
    print('Đã mở GrabFood với từ khóa: $restaurantName');
  }

  /// Mở ứng dụng ShopeeFood với từ khóa quán ăn
  static Future<void> openShopeeFood(String restaurantName) async {
    final query = Uri.encodeComponent(restaurantName);
    final url = "shopeefood://search?keyword=$query";
    
    try {
      if (await canLaunchUrl(Uri.parse(url))) {
        await launchUrl(Uri.parse(url));
      } else {
        await launchUrl(Uri.parse("https://shopeefood.vn/ho-chi-minh/danh-sach-dia-diem-giao-tan-noi?q=$query"));
      }
    } catch (e) {
      print('Lỗi mở ShopeeFood: $e');
    }
    
    print('Đã mở ShopeeFood với từ khóa: $restaurantName');
  }

  /// Mở ứng dụng BeFood
  static Future<void> openBeFood(String restaurantName) async {
    final query = Uri.encodeComponent(restaurantName);
    final url = "be://food/search?q=$query";
    
    try {
      if (await canLaunchUrl(Uri.parse(url))) {
        await launchUrl(Uri.parse(url));
      } else {
        await launchUrl(Uri.parse("https://begroup.vn/"));
      }
    } catch (e) {
      print('Lỗi mở BeFood: $e');
    }
    
    print('Đã mở BeFood với từ khóa: $restaurantName');
  }
}
