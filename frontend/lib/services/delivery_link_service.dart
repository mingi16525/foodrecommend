import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

class DeliveryLinkService {
  /// Mở ứng dụng GrabFood với từ khóa quán ăn hoặc direct URL
  static Future<bool> openGrabFood(String restaurantName, {String? directUrl}) async {
    final query = Uri.encodeComponent(restaurantName);
    final appUrl = Uri.parse("grab://open?screenType=GRABFOOD&searchQuery=$query");
    final targetUrl = directUrl != null && directUrl.isNotEmpty
        ? Uri.parse(directUrl)
        : Uri.parse("https://food.grab.com/vn/vi/restaurants?search=$query");

    try {
      if (!kIsWeb && await canLaunchUrl(appUrl)) {
        return await launchUrl(appUrl, mode: LaunchMode.externalApplication);
      }
      return await launchUrl(targetUrl, mode: LaunchMode.externalApplication);
    } catch (e) {
      assert(() {
        debugPrint('Lỗi mở GrabFood: $e');
        return true;
      }());
      return false;
    }
  }

  /// Mở ứng dụng ShopeeFood với từ khóa quán ăn hoặc direct URL
  static Future<bool> openShopeeFood(String restaurantName, {String? directUrl}) async {
    final query = Uri.encodeComponent(restaurantName);
    final appUrl = Uri.parse("shopeefood://search?keyword=$query");
    final targetUrl = directUrl != null && directUrl.isNotEmpty
        ? Uri.parse(directUrl)
        : Uri.parse("https://shopeefood.vn/tim-kiem?keyword=$query");

    try {
      if (!kIsWeb && await canLaunchUrl(appUrl)) {
        return await launchUrl(appUrl, mode: LaunchMode.externalApplication);
      }
      return await launchUrl(targetUrl, mode: LaunchMode.externalApplication);
    } catch (e) {
      assert(() {
        debugPrint('Lỗi mở ShopeeFood: $e');
        return true;
      }());
      return false;
    }
  }

  /// Mở ứng dụng beFood với từ khóa quán ăn hoặc direct URL
  static Future<bool> openBeFood(String restaurantName, {String? directUrl}) async {
    final query = Uri.encodeComponent(restaurantName);
    final appUrl = Uri.parse("be://food/search?q=$query");
    final targetUrl = directUrl != null && directUrl.isNotEmpty
        ? Uri.parse(directUrl)
        : Uri.parse("https://food.be.com.vn");

    try {
      if (!kIsWeb && await canLaunchUrl(appUrl)) {
        return await launchUrl(appUrl, mode: LaunchMode.externalApplication);
      }
      return await launchUrl(targetUrl, mode: LaunchMode.externalApplication);
    } catch (e) {
      assert(() {
        debugPrint('Lỗi mở beFood: $e');
        return true;
      }());
      return false;
    }
  }

  /// Hiển thị Modal Sheet cho người dùng chọn nền tảng giao đồ ăn (ShopeeFood, Be, Grab)
  static void showDeliveryOptions(
    BuildContext context,
    String restaurantName,
    Map<String, dynamic>? deliveryLinks,
  ) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (BuildContext ctx) {
        final links = deliveryLinks ?? {};
        final shopeeUrl = links['shopeefood'] as String?;
        final beUrl = (links['be_app'] ?? links['be']) as String?;
        final grabUrl = links['grab'] as String?;

        return SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Center(
                  child: Container(
                    width: 40,
                    height: 4,
                    decoration: BoxDecoration(
                      color: Colors.grey.shade300,
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                Text(
                  'Đặt món từ "$restaurantName"',
                  style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 6),
                const Text(
                  'Chọn ứng dụng giao đồ ăn bạn muốn chuyển tiếp:',
                  style: TextStyle(fontSize: 14, color: Colors.black54),
                ),
                const SizedBox(height: 20),
                ListTile(
                  leading: Container(
                    width: 44,
                    height: 44,
                    decoration: BoxDecoration(
                      color: const Color(0xFFEE4D2D).withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Icon(Icons.shopping_bag_outlined, color: Color(0xFFEE4D2D)),
                  ),
                  title: const Text('ShopeeFood', style: TextStyle(fontWeight: FontWeight.w600)),
                  subtitle: const Text('Mở tìm kiếm hoặc thực đơn trên ShopeeFood'),
                  trailing: const Icon(Icons.chevron_right, color: Colors.grey),
                  onTap: () {
                    Navigator.pop(ctx);
                    openShopeeFood(restaurantName, directUrl: shopeeUrl);
                  },
                ),
                const Divider(height: 1),
                ListTile(
                  leading: Container(
                    width: 44,
                    height: 44,
                    decoration: BoxDecoration(
                      color: const Color(0xFFFFC107).withValues(alpha: 0.2),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Icon(Icons.two_wheeler, color: Color(0xFFE65100)),
                  ),
                  title: const Text('Be Food', style: TextStyle(fontWeight: FontWeight.w600)),
                  subtitle: const Text('Mở dịch vụ beFood trên ứng dụng Be'),
                  trailing: const Icon(Icons.chevron_right, color: Colors.grey),
                  onTap: () {
                    Navigator.pop(ctx);
                    openBeFood(restaurantName, directUrl: beUrl);
                  },
                ),
                const Divider(height: 1),
                ListTile(
                  leading: Container(
                    width: 44,
                    height: 44,
                    decoration: BoxDecoration(
                      color: const Color(0xFF00B14F).withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Icon(Icons.delivery_dining, color: Color(0xFF00B14F)),
                  ),
                  title: const Text('GrabFood', style: TextStyle(fontWeight: FontWeight.w600)),
                  subtitle: const Text('Mở tìm kiếm quán ăn trên GrabFood'),
                  trailing: const Icon(Icons.chevron_right, color: Colors.grey),
                  onTap: () {
                    Navigator.pop(ctx);
                    openGrabFood(restaurantName, directUrl: grabUrl);
                  },
                ),
                const SizedBox(height: 10),
              ],
            ),
          ),
        );
      },
    );
  }
}
