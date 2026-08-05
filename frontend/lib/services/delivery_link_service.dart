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
      // ignore: avoid_print
      assert(() { print('Lỗi mở GrabFood: $e'); return true; }());
    }
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
      // ignore: avoid_print
      assert(() { print('Lỗi mở ShopeeFood: $e'); return true; }());
    }
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
      // ignore: avoid_print
      assert(() { print('Lỗi mở BeFood: $e'); return true; }());
    }
  }
}
