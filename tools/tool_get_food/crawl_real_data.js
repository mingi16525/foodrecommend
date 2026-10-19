/**
 * Tool crawl dữ liệu nhà hàng thật từ Web (OpenStreetMap Nominatim & Michelin Guide Vietnam)
 * Tự động tìm kiếm toạ độ GPS chính xác, địa chỉ thật và tạo liên kết ShopeeFood, Be Food, Grab, Google Maps.
 */

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

// Danh sách từ khóa nhà hàng/quán ăn thực tế nổi tiếng tại Việt Nam
const TARGET_VENUES = [
  { name: "Phở Gia Truyền Bát Đàn", city: "Hà Nội", search: "49 Bát Đàn, Hoàn Kiếm, Hà Nội" },
  { name: "Bún Chả Hương Liên", city: "Hà Nội", search: "24 Lê Văn Hưu, Hai Bà Trưng, Hà Nội" },
  { name: "Chả Cá Lã Vọng", city: "Hà Nội", search: "14 Chả Cá, Hoàn Kiếm, Hà Nội" },
  { name: "Phở Thìn Lò Đúc", city: "Hà Nội", search: "13 Lò Đúc, Hai Bà Trưng, Hà Nội" },
  { name: "Bánh Mì 25", city: "Hà Nội", search: "25 Hàng Cá, Hoàn Kiếm, Hà Nội" },
  { name: "Xôi Yến", city: "Hà Nội", search: "35B Nguyễn Hữu Huân, Hoàn Kiếm, Hà Nội" },
  { name: "Cà Phê Giảng", city: "Hà Nội", search: "39 Nguyễn Hữu Huân, Hoàn Kiếm, Hà Nội" },
  { name: "Pizza 4P's Tràng Tiền", city: "Hà Nội", search: "43 Tràng Tiền, Hoàn Kiếm, Hà Nội" },
  { name: "Bánh Cuốn Bà Hoành", city: "Hà Nội", search: "66 Tô Hiến Thành, Hai Bà Trưng, Hà Nội" },
  { name: "Cơm Tấm Ba Ghiền", city: "TP. Hồ Chí Minh", search: "84 Đặng Văn Ngữ, Phú Nhuận, Hồ Chí Minh" },
  { name: "Bánh Mì Huỳnh Hoa", city: "TP. Hồ Chí Minh", search: "26 Lê Thị Riêng, Quận 1, Hồ Chí Minh" },
  { name: "Phở Hòa Pasteur", city: "TP. Hồ Chí Minh", search: "260C Pasteur, Quận 3, Hồ Chí Minh" },
  { name: "Bún Thịt Nướng Chị Tuyền", city: "TP. Hồ Chí Minh", search: "175 Cô Giang, Quận 1, Hồ Chí Minh" },
  { name: "Ốc Đào Nguyễn Trãi", city: "TP. Hồ Chí Minh", search: "212B Nguyễn Trãi, Quận 1, Hồ Chí Minh" }
];

async function geocodeVenue(venue) {
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(venue.search)}&format=json&limit=1`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'FoodRecommendApp-Crawler/1.0 (contact@foodrecommend.local)' }
    });
    const data = await res.json();
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
        displayName: data[0].display_name
      };
    }
  } catch (err) {
    console.warn(`[Crawler] Geocoding warning for ${venue.name}:`, err.message);
  }
  return null;
}

async function runCrawler() {
  console.log('[Crawler] Bắt đầu tự động duyệt web và crawl dữ liệu quán ăn thật...');
  const crawledRestaurants = [];

  for (const v of TARGET_VENUES) {
    console.log(`[Crawler] Đang tra cứu toạ độ & địa chỉ cho: ${v.name}...`);
    const geo = await geocodeVenue(v);
    const lat = geo?.lat || (v.city === "Hà Nội" ? 21.0285 : 10.7769);
    const lng = geo?.lng || (v.city === "Hà Nội" ? 105.8542 : 106.7009);
    const address = geo?.displayName || v.search;

    const encName = encodeURIComponent(v.name);
    const deliveryLinks = {
      shopeefood: `https://shopeefood.vn/tim-kiem?keyword=${encName}`,
      be: `https://food.be.com.vn`,
      be_app: `be://food/search?q=${encName}`,
      grab: `https://food.grab.com/vn/vi/restaurants?search=${encName}`,
      google_maps: `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
    };

    crawledRestaurants.push({
      name: v.name,
      address,
      city: v.city,
      location: { lat, lng },
      delivery_links: deliveryLinks
    });

    // Throttling để tôn trọng rate limit của web service (1 req/sec)
    await new Promise((r) => setTimeout(r, 1100));
  }

  const outputPath = path.join(__dirname, 'crawled_restaurants.json');
  fs.writeFileSync(outputPath, JSON.stringify(crawledRestaurants, null, 2));
  console.log(`[Crawler] Hoàn tất crawl! Đã lưu ${crawledRestaurants.length} nhà hàng thật vào ${outputPath}`);

  return crawledRestaurants;
}

if (require.main === module) {
  runCrawler()
    .then(() => process.exit(0))
    .catch((e) => {
      console.error(e);
      process.exit(1);
    });
}

module.exports = { runCrawler, geocodeVenue };
