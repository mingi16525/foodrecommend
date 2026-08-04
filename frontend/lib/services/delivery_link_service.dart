class DeliveryLinkService {
  /// Mở ứng dụng GrabFood với từ khóa quán ăn
  static Future<void> openGrabFood(String restaurantName) async {
    final query = Uri.encodeComponent(restaurantName);
    final url = "grab://open?screenType=GRABFOOD&searchQuery=$query";
    
    // if (await canLaunchUrl(Uri.parse(url))) {
    //   await launchUrl(Uri.parse(url));
    // } else {
    //   // Mở trình duyệt web thay thế
    //   await launchUrl(Uri.parse("https://food.grab.com/vn/vi/restaurants?search=$query"));
    // }
    
    print('Giả lập mở GrabFood với từ khóa: $restaurantName ($url)');
  }

  /// Mở ứng dụng ShopeeFood với từ khóa quán ăn
  static Future<void> openShopeeFood(String restaurantName) async {
    final query = Uri.encodeComponent(restaurantName);
    final url = "shopeefood://search?keyword=$query";
    
    // if (await canLaunchUrl(Uri.parse(url))) {
    //   await launchUrl(Uri.parse(url));
    // } else {
    //   // Mở trình duyệt web thay thế
    //   await launchUrl(Uri.parse("https://shopeefood.vn/ho-chi-minh/danh-sach-dia-diem-giao-tan-noi?q=$query"));
    // }
    
    print('Giả lập mở ShopeeFood với từ khóa: $restaurantName ($url)');
  }

  /// Mở ứng dụng BeFood
  static Future<void> openBeFood(String restaurantName) async {
    final query = Uri.encodeComponent(restaurantName);
    final url = "be://food/search?q=$query";
    
    print('Giả lập mở BeFood với từ khóa: $restaurantName ($url)');
  }
}
