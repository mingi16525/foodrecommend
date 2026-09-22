require('dotenv').config({ path: '../../.env' });
const { Client } = require('pg');
const puppeteer = require('puppeteer');

// 1. Lấy danh sách nhà hàng thật từ Michelin Guide
async function fetchRealRestaurants(browser) {
  console.log('Đang kéo dữ liệu nhà hàng thật từ Michelin Guide Hanoi...');
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36');
  const restaurants = [];
  try {
    await page.goto('https://guide.michelin.com/en/vn/hanoi-region/hanoi/restaurants', { waitUntil: 'domcontentloaded', timeout: 60000 });
    // Đợi 5s để trang load xong (tránh lỗi Navigation Context Destroyed do redirect)
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    const resData = await page.evaluate(() => {
      const data = [];
      const cards = document.querySelectorAll('.card__menu');
      cards.forEach(card => {
        const titleEl = card.querySelector('.card__menu-content--title a');
        const locEl = card.querySelector('.card__menu-footer--location');
        if (titleEl) {
          data.push({
            name: titleEl.innerText.trim(),
            address: locEl ? locEl.innerText.trim() : 'Hà Nội'
          });
        }
      });
      return data;
    });
    
    // Tạo tọa độ ngẫu nhiên xung quanh trung tâm Hà Nội (vì web không có sẵn lat/lng trực tiếp)
    resData.forEach(r => {
      const lat = 21.0285 + (Math.random() - 0.5) * 0.05;
      const lng = 105.8542 + (Math.random() - 0.5) * 0.05;
      restaurants.push({ ...r, lat, lng });
    });
    console.log(`Lấy thành công ${restaurants.length} nhà hàng.`);
    return restaurants;
  } catch (error) {
    console.error('Lỗi khi lấy dữ liệu Michelin:', error.message);
    return [];
  } finally {
    await page.close();
  }
}

// 2. Cào danh sách món ăn thật từ Wikipedia
async function crawlDishesWithPuppeteer(browser) {
  console.log('Đang cào dữ liệu món ăn thực tế từ Wikipedia...');
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36');
  const dishes = [];
  try {
    await page.goto('https://en.wikipedia.org/wiki/List_of_Vietnamese_dishes', { waitUntil: 'domcontentloaded', timeout: 60000 });
    
    const dishNames = await page.evaluate(() => {
      const names = [];
      // Lấy cột đầu tiên của các bảng danh sách món ăn
      const rows = document.querySelectorAll('.wikitable tbody tr');
      rows.forEach(row => {
        const firstCol = row.querySelector('td:first-child');
        if (firstCol) {
          const text = firstCol.innerText.trim();
          // Lọc bỏ những dòng không phải là tên món
          if (text && text.length < 50 && !text.includes('\\n')) {
            names.push(text);
          }
        }
      });
      return names;
    });
    
    // Tạo cấu trúc dữ liệu phong phú (kèm ngẫu nhiên giá và loại)
    dishNames.forEach(name => {
      const isCombo = name.toLowerCase().includes('lẩu') || name.toLowerCase().includes('mâm') || Math.random() < 0.1;
      const basePrice = Math.floor(Math.random() * 15 + 3) * 10000; // 30k -> 180k
      dishes.push({
        name: name,
        price: isCombo ? basePrice * 3 : basePrice,
        type: isCombo ? 'combo' : 'single',
        description: `Món ăn đặc sản: ${name}`
      });
    });
    console.log(`Cào thành công ${dishes.length} món ăn.`);
  } catch (error) {
    console.error('Lỗi khi cào Wikipedia:', error.message);
  } finally {
    await page.close();
  }
  return dishes;
}

async function scrapeAndSeed(db) {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  try {
    const [restaurants, dishes] = await Promise.all([
      fetchRealRestaurants(browser),
      crawlDishesWithPuppeteer(browser)
    ]);

    if (restaurants.length === 0 || dishes.length === 0) {
      console.log('Không đủ dữ liệu, thoát.');
      return;
    }

    console.log('Bắt đầu nhồi dữ liệu vào PostgreSQL...');
    let resCount = 0;
    for (const r of restaurants) {
      // Tránh trùng tên
      let res = await db.query('SELECT id FROM restaurants WHERE name = $1', [r.name]);
      let restaurantId;
      if (res.rows.length > 0) {
        restaurantId = res.rows[0].id;
      } else {
        res = await db.query(
          `INSERT INTO restaurants (name, address, location) 
           VALUES ($1, $2, $3) 
           RETURNING id`,
          [r.name, r.address, JSON.stringify({ lat: r.lat, lng: r.lng })]
        );
        restaurantId = res.rows[0].id;
        resCount++;
      }

      // Chọn ngẫu nhiên 5-10 món cho quán này
      const menuSize = Math.floor(Math.random() * 6) + 5;
      const shuffledDishes = dishes.sort(() => 0.5 - Math.random()).slice(0, menuSize);

      for (const d of shuffledDishes) {
        const dishRes = await db.query('SELECT id FROM dishes WHERE restaurant_id = $1 AND name = $2', [restaurantId, d.name]);
        if (dishRes.rows.length === 0) {
          await db.query(
            `INSERT INTO dishes (restaurant_id, name, description, price, image_url, item_type)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [restaurantId, d.name, d.description, d.price, 'https://via.placeholder.com/150', d.type]
          );
        }
      }
    }
    console.log(`Đã Insert thành công ${resCount} nhà hàng mới cùng thực đơn thực tế!`);
  } finally {
    await browser.close();
  }
}

async function main() {
  const db = new Client({
    connectionString: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/food_recommend_db'
  });
  
  try {
    await db.connect();
    console.log('Connected to DB');
    
    await scrapeAndSeed(db);
    
  } catch (err) {
    console.error('Lỗi tổng:', err);
  } finally {
    await db.end();
  }
}

main();
