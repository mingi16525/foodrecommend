const fs = require('fs');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const uuidv4 = crypto.randomUUID;

const generateSeed = () => {
  let sql = `-- seed.sql: Data mẫu cho FoodRecommend DB (Local Beta)\n\n`;
  sql += `-- Xóa dữ liệu cũ (tuân thủ foreign keys)\n`;
  sql += `TRUNCATE TABLE groups, posts, dishes, restaurants, user_preferences, users CASCADE;\n\n`;

  // 1. Generate 20 Users + 1 Test User
  const users = [];
  sql += `-- Insert 21 Users\nINSERT INTO users (id, email, password_hash, full_name, is_reviewer) VALUES\n`;
  
  const testUserId = uuidv4();
  users.push(testUserId);
  const testHash = bcrypt.hashSync('password123', 10);
  sql += `('${testUserId}', 'test@example.com', '${testHash}', 'Test User', true),\n`;

  for (let i = 0; i < 20; i++) {
    const id = uuidv4();
    users.push(id);
    const isReviewer = i < 5;
    const hash = bcrypt.hashSync('password123', 10);
    sql += `('${id}', 'user${i}@example.com', '${hash}', 'User ${i}', ${isReviewer})${i === 19 ? ';' : ','}\n`;
  }
  sql += '\n';

  // 2. Generate User Preferences
  const flavors = ['spicy', 'sweet', 'savory', 'sour', 'bitter'];
  const allergies = ['peanuts', 'seafood', 'dairy', 'gluten', 'soy'];
  
  sql += `-- Insert User Preferences\nINSERT INTO user_preferences (user_id, favorite_flavors, allergies, dietary_restrictions) VALUES\n`;
  users.forEach((userId, i) => {
    const favFlavors = [flavors[i % flavors.length], flavors[(i + 1) % flavors.length]];
    const algs = i % 3 === 0 ? [allergies[i % allergies.length]] : [];
    const diet = i % 7 === 0 ? '["vegetarian"]' : '[]';
    
    sql += `('${userId}', '${JSON.stringify(favFlavors)}', '${JSON.stringify(algs)}', '${diet}')${i === users.length - 1 ? ';' : ','}\n`;
  });
  sql += '\n';

  // 3. Realistic Hanoi Restaurants
  const hanoiRestaurants = [
    { name: "Phở Bát Đàn", lat: 21.0319, lng: 105.8465, food: "Phở bò truyền thống" },
    { name: "Bún Chả Hương Liên", lat: 21.0163, lng: 105.8524, food: "Bún chả Obama" },
    { name: "Chả Cá Lã Vọng", lat: 21.0336, lng: 105.8496, food: "Chả cá Hà Nội" },
    { name: "Phở Thìn Lò Đúc", lat: 21.0152, lng: 105.8552, food: "Phở bò tái lăn" },
    { name: "Bánh Mì Phố Cổ", lat: 21.0330, lng: 105.8500, food: "Bánh mì Hội An" },
    { name: "Xôi Yến", lat: 21.0321, lng: 105.8546, food: "Xôi xéo thập cẩm" },
    { name: "Bún Ốc Bà Lương", lat: 21.0028, lng: 105.8239, food: "Bún ốc chuối đậu" },
    { name: "Nem Chua Rán Ngõ Tạm Thương", lat: 21.0315, lng: 105.8490, food: "Nem chua rán" },
    { name: "Cà Phê Giảng", lat: 21.0310, lng: 105.8540, food: "Cà phê trứng" },
    { name: "Bún Bò Huế O Xuân", lat: 21.0190, lng: 105.8480, food: "Bún bò Huế" },
    { name: "Pizza 4P''s Tràng Tiền", lat: 21.0250, lng: 105.8560, food: "Pizza Burrata" },
    { name: "KFC Thái Hà", lat: 21.0110, lng: 105.8190, food: "Gà rán" },
    { name: "Nét Huế", lat: 21.0050, lng: 105.8450, food: "Bún hến, bánh nậm" },
    { name: "Manwah Lẩu Đài Loan", lat: 21.0150, lng: 105.8150, food: "Lẩu mala" },
    { name: "Gogi House", lat: 21.0200, lng: 105.8100, food: "Thịt nướng Hàn Quốc" },
    { name: "Bánh Cuốn Bà Hoành", lat: 21.0185, lng: 105.8525, food: "Bánh cuốn chả" },
    { name: "Phở Lý Quốc Sư", lat: 21.0287, lng: 105.8492, food: "Phở tái chín" },
    { name: "Bún Đậu Ngõ Hàng Khay", lat: 21.0264, lng: 105.8521, food: "Bún đậu mắm tôm" },
    { name: "Haidilao Vincom Center", lat: 21.0105, lng: 105.8505, food: "Lẩu Tứ Xuyên" },
    { name: "Highlands Coffee Hồ Gươm", lat: 21.0311, lng: 105.8522, food: "Trà sen vàng" }
  ];

  const restaurants = [];
  sql += `-- Insert 20 Realistic Hanoi Restaurants\nINSERT INTO restaurants (id, name, address, location, geohash, delivery_links) VALUES\n`;
  hanoiRestaurants.forEach((r, i) => {
    const id = uuidv4();
    restaurants.push(id);
    const geohash = `w3w${i % 10}`;
    const links = `{"shopeefood": "link_${i}"}`;
    sql += `('${id}', '${r.name}', 'Hà Nội', '{"lat": ${r.lat}, "lng": ${r.lng}}', '${geohash}', '${links}')${i === hanoiRestaurants.length - 1 ? ';' : ','}\n`;
  });
  sql += '\n';

  // 4. Generate 200 Dishes (10 per restaurant)
  const ingredientsList = ['beef', 'chicken', 'pork', 'fish', 'shrimp', 'noodles', 'rice', 'vegetables', 'chili', 'peanuts', 'milk', 'egg'];
  sql += `-- Insert 200 Dishes\nINSERT INTO dishes (id, restaurant_id, name, price, image_url, ingredients) VALUES\n`;
  let dishCount = 0;
  const allDishes = [];
  const dishIdsForPosts = [];
  
  for (let r = 0; r < hanoiRestaurants.length; r++) {
    const restId = restaurants[r];
    for (let d = 0; d < 10; d++) {
      const id = uuidv4();
      dishIdsForPosts.push(id);
      
      const isSignature = d === 0;
      const dishName = isSignature ? hanoiRestaurants[r].food : `Món phụ ${d} của ${hanoiRestaurants[r].name}`;
      const price = Math.floor(Math.random() * 10) * 10000 + 40000;
      
      const ing1 = ingredientsList[Math.floor(Math.random() * ingredientsList.length)];
      const ing2 = ingredientsList[Math.floor(Math.random() * ingredientsList.length)];
      const ingredients = `["${ing1}", "${ing2}"]`;
      const imageUrl = `https://images.unsplash.com/photo-${1500000000000 + r * 100 + d}`;
      
      sql += `('${id}', '${restId}', '${dishName}', ${price}, '${imageUrl}', '${ingredients}')${dishCount === 199 ? ';' : ','}\n`;
      dishCount++;
      
      allDishes.push({
        id: id,
        name: dishName,
        ingredients: [ing1, ing2],
        embedding: Array.from({length: 384}, () => Math.random() * 2 - 1),
        payload: {
          name: dishName,
          lat: hanoiRestaurants[r].lat,
          lng: hanoiRestaurants[r].lng
        }
      });
    }
  }
  sql += '\n';

  // 5. Generate 40 Posts for Feed with dish_id!
  sql += `-- Insert 40 Posts\nINSERT INTO posts (id, user_id, post_type, video_url, content, dish_id) VALUES\n`;
  for (let i = 0; i < 40; i++) {
    const id = uuidv4();
    const userId = users[Math.floor(Math.random() * users.length)];
    const dishId = dishIdsForPosts[Math.floor(Math.random() * dishIdsForPosts.length)];
    const postType = 'video';
    const videoUrls = [
      'https://www.w3schools.com/html/mov_bbb.mp4',
      'https://www.w3schools.com/html/mov_bbb.mp4'
    ];
    const videoUrl = videoUrls[i % videoUrls.length];
    
    const captions = [
      'Trải nghiệm quá đỉnh tại nhà hàng này!',
      'Ngon nhức nách luôn các bạn ơi.',
      'Sẽ quay lại lần sau, không gian tuyệt vời.',
      'Đồ ăn ngon nhưng phục vụ hơi chậm xíu.',
      'Rất đáng tiền, mọi người nên thử nha!'
    ];
    const content = captions[i % captions.length];
    
    sql += `('${id}', '${userId}', '${postType}', '${videoUrl}', '${content}', '${dishId}')${i === 39 ? ';' : ','}\n`;
  }
  sql += '\n';

  fs.writeFileSync('seed.sql', sql);
  fs.writeFileSync('dish_embeddings.json', JSON.stringify(allDishes, null, 2));
  console.log('Successfully generated seed.sql and dish_embeddings.json with 21 users, 20 real restaurants, 200 dishes, and 40 posts.');
};

generateSeed();
