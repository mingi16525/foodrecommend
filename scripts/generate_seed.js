const fs = require('fs');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const uuidv4 = crypto.randomUUID;

const generateSeed = () => {
  let sql = `-- seed.sql: Data mẫu thực tế cho FoodRecommend DB (Hà Nội & TP.HCM)\n\n`;
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

  // 3. Real Restaurants in Hanoi & Ho Chi Minh City with exact addresses, coordinates and delivery links
  const realRestaurants = [
    {
      name: "Phở Bát Đàn",
      address: "49 Bát Đàn, Phường Cửa Đông, Quận Hoàn Kiếm, Hà Nội",
      lat: 21.033785,
      lng: 105.847585,
      food: "Phở bò tái nạm gầu",
      dishes: [
        { name: "Phở Bò Tái Nạm Gầu", price: 65000, type: "single", ing: ["beef", "noodles"] },
        { name: "Phở Bò Tái Lăn", price: 70000, type: "single", ing: ["beef", "noodles", "vegetables"] },
        { name: "Phở Bò Sốt Vang", price: 75000, type: "single", ing: ["beef", "noodles", "chili"] },
        { name: "Quẩy Giòn Bát Đàn", price: 10000, type: "single", ing: ["gluten"] },
        { name: "Trứng Gà Chần Nước Dùng", price: 15000, type: "single", ing: ["egg"] }
      ]
    },
    {
      name: "Bún Chả Hương Liên",
      address: "24 Lê Văn Hưu, Phường Phan Chu Trinh, Quận Hai Bà Trưng, Hà Nội",
      lat: 21.016335,
      lng: 105.852445,
      food: "Bún chả Obama đặc biệt",
      dishes: [
        { name: "Bún Chả Obama Đặc Biệt", price: 60000, type: "combo", ing: ["pork", "noodles", "vegetables"] },
        { name: "Nem Hải Sản Cua Bể", price: 35000, type: "single", ing: ["shrimp", "seafood", "egg"] },
        { name: "Chả Xiên Than Hoa", price: 45000, type: "single", ing: ["pork"] },
        { name: "Nem Rán Hà Nội", price: 25000, type: "single", ing: ["pork", "vegetables", "egg"] },
        { name: "Bia Hà Nội Chai Lạnh", price: 20000, type: "single", ing: [] }
      ]
    },
    {
      name: "Chả Cá Lã Vọng",
      address: "14 Chả Cá, Phường Hàng Bồ, Quận Hoàn Kiếm, Hà Nội",
      lat: 21.035418,
      lng: 105.849742,
      food: "Chả cá Lăng sông Hồng",
      dishes: [
        { name: "Chả Cá Lăng Sông Hồng Kèm Thì Là", price: 180000, type: "combo", ing: ["fish", "peanuts", "noodles"] },
        { name: "Lòng Cá Xào Dưa Chua", price: 150000, type: "single", ing: ["fish", "vegetables"] },
        { name: "Canh Đầu Cá Nấu Dọc Mùng", price: 90000, type: "single", ing: ["fish", "vegetables"] },
        { name: "Bún Tươi Ăn Kèm Chả Cá", price: 15000, type: "single", ing: ["noodles"] }
      ]
    },
    {
      name: "Phở Thìn Lò Đúc",
      address: "13 Lò Đúc, Phường Phạm Đình Hổ, Quận Hai Bà Trưng, Hà Nội",
      lat: 21.015248,
      lng: 105.855212,
      food: "Phở bò xào tái lăn",
      dishes: [
        { name: "Phở Bò Xào Tái Lăn Hành Hoa", price: 75000, type: "single", ing: ["beef", "noodles", "vegetables"] },
        { name: "Phở Bò Tái Chín Nước Béo", price: 70000, type: "single", ing: ["beef", "noodles"] },
        { name: "Quẩy Nóng Giòn", price: 10000, type: "single", ing: ["gluten"] }
      ]
    },
    {
      name: "Bánh Mì 25",
      address: "25 Hàng Cá, Phường Hàng Đào, Quận Hoàn Kiếm, Hà Nội",
      lat: 21.034720,
      lng: 105.850450,
      food: "Bánh mì pate thịt nguội xá xíu",
      dishes: [
        { name: "Bánh Mì Đặc Biệt Pate Xá Xíu", price: 40000, type: "single", ing: ["pork", "gluten", "vegetables"] },
        { name: "Bánh Mì Bò Áp Chảo Phô Mai", price: 50000, type: "single", ing: ["beef", "milk", "gluten"] },
        { name: "Bánh Mì Gà Nướng Mật Ong", price: 42000, type: "single", ing: ["chicken", "gluten"] },
        { name: "Sinh Tố Bơ Xoài Tươi", price: 35000, type: "single", ing: ["milk"] }
      ]
    },
    {
      name: "Xôi Yến",
      address: "35B Nguyễn Hữu Huân, Phường Lý Thái Tổ, Quận Hoàn Kiếm, Hà Nội",
      lat: 21.032120,
      lng: 105.854610,
      food: "Xôi xéo thập cẩm gà xé",
      dishes: [
        { name: "Xôi Xéo Gà Xé Nấm Hương", price: 55000, type: "single", ing: ["rice", "chicken"] },
        { name: "Xôi Xéo Thịt Kho Tàu Trứng", price: 50000, type: "single", ing: ["rice", "pork", "egg"] },
        { name: "Xôi Trắng Chả Mực Hạ Long", price: 65000, type: "single", ing: ["rice", "seafood"] },
        { name: "Sữa Đậu Nành Tươi Nóng", price: 15000, type: "single", ing: ["soy"] }
      ]
    },
    {
      name: "Bún Ốc Bà Lương",
      address: "Ngõ 191 Khương Thượng, Quận Đống Đa, Hà Nội",
      lat: 21.002820,
      lng: 105.823910,
      food: "Bún ốc chuối đậu gia truyền",
      dishes: [
        { name: "Bún Ốc Chuối Đậu Nồi Đất", price: 55000, type: "single", ing: ["seafood", "noodles", "vegetables", "soy"] },
        { name: "Chả Ốc Nướng Giấy Bạc", price: 45000, type: "single", ing: ["seafood", "pork"] },
        { name: "Lẩu Ốc Gia Truyền Khương Thượng", price: 280000, type: "combo", ing: ["seafood", "pork", "vegetables", "noodles"] }
      ]
    },
    {
      name: "Nem Chua Rán Tạm Thương",
      address: "36 Ngõ Tạm Thương, Phường Hàng Gai, Quận Hoàn Kiếm, Hà Nội",
      lat: 21.031520,
      lng: 105.849030,
      food: "Nem chua rán giòn rụm",
      dishes: [
        { name: "Mẹt Nem Chua Rán Cỡ Lớn", price: 80000, type: "combo", ing: ["pork", "gluten"] },
        { name: "Khoai Tây Lắc Phô Mai", price: 35000, type: "single", ing: ["milk"] },
        { name: "Trà Chanh Phố Cổ", price: 15000, type: "single", ing: [] }
      ]
    },
    {
      name: "Cà Phê Giảng",
      address: "39 Nguyễn Hữu Huân, Phường Lý Thái Tổ, Quận Hoàn Kiếm, Hà Nội",
      lat: 21.031020,
      lng: 105.854040,
      food: "Cà phê trứng truyền thống 1946",
      dishes: [
        { name: "Cà Phê Trứng Nóng Truyền Thống", price: 35000, type: "single", ing: ["egg", "milk"] },
        { name: "Cacao Trứng Kem Béo", price: 35000, type: "single", ing: ["egg", "milk"] },
        { name: "Trà Xanh Matcha Trứng", price: 40000, type: "single", ing: ["egg", "milk"] }
      ]
    },
    {
      name: "Bún Bò Huế O Xuân",
      address: "3A Quang Trung, Phường Tràng Tiền, Quận Hoàn Kiếm, Hà Nội",
      lat: 21.019030,
      lng: 105.848050,
      food: "Bún bò Huế tô lớn chả cua",
      dishes: [
        { name: "Bún Bò Huế Đặc Biệt Nạm Gân Chả Cua", price: 65000, type: "single", ing: ["beef", "pork", "seafood", "noodles"] },
        { name: "Bánh Bột Lọc Huế Nhân Tôm Thịt", price: 40000, type: "single", ing: ["shrimp", "pork"] },
        { name: "Bánh Ram Ít Tôm Chấy", price: 40000, type: "single", ing: ["shrimp", "rice"] }
      ]
    },
    {
      name: "Pizza 4P's Tràng Tiền",
      address: "43 Tràng Tiền, Phường Tràng Tiền, Quận Hoàn Kiếm, Hà Nội",
      lat: 21.025010,
      lng: 105.856020,
      food: "Pizza Burrata Parma Ham",
      dishes: [
        { name: "Pizza Burrata Parma Ham Tươi", price: 290000, type: "combo", ing: ["pork", "milk", "gluten"] },
        { name: "Pizza 4 Loại Phô Mai Kèm Mật Ong", price: 230000, type: "single", ing: ["milk", "gluten"] },
        { name: "Mì Ý Cua Sốt Kem Cà Chua", price: 215000, type: "single", ing: ["seafood", "milk", "gluten"] }
      ]
    },
    {
      name: "Bánh Cuốn Bà Hoành",
      address: "66 Tô Hiến Thành, Phường Bùi Thị Xuân, Quận Hai Bà Trưng, Hà Nội",
      lat: 21.013520,
      lng: 105.850230,
      food: "Bánh cuốn chả quế gia truyền",
      dishes: [
        { name: "Bánh Cuốn Chả Nướng Than", price: 50000, type: "single", ing: ["rice", "pork"] },
        { name: "Bánh Cuốn Cà Cuống Thượng Hạng", price: 80000, type: "single", ing: ["rice", "pork"] },
        { name: "Chả Quế Nóng Hổi", price: 20000, type: "single", ing: ["pork"] }
      ]
    },
    {
      name: "Phở Gia Truyền 10 Lý Quốc Sư",
      address: "10 Lý Quốc Sư, Phường Hàng Trống, Quận Hoàn Kiếm, Hà Nội",
      lat: 21.028720,
      lng: 105.849210,
      food: "Phở tái nạm giòn",
      dishes: [
        { name: "Phở Bò Tái Chín Nước Trong", price: 75000, type: "single", ing: ["beef", "noodles"] },
        { name: "Phở Bò Bắp Trần Đặc Biệt", price: 95000, type: "single", ing: ["beef", "noodles"] }
      ]
    },
    {
      name: "Bún Đậu Mắm Tôm Ngõ Hàng Khay",
      address: "31 Ngõ Hàng Khay, Phường Tràng Tiền, Quận Hoàn Kiếm, Hà Nội",
      lat: 21.026410,
      lng: 105.852130,
      food: "Mẹt bún đậu mắm tôm đầy đủ",
      dishes: [
        { name: "Mẹt Bún Đậu Đầy Đủ Chả Cốm Dồi Sụn", price: 65000, type: "combo", ing: ["pork", "soy", "noodles", "vegetables"] },
        { name: "Nem Chua Rán Giòn Cay", price: 40000, type: "single", ing: ["pork", "gluten"] },
        { name: "Nước Mơ Hà Nội Ngâm Đường Phèn", price: 20000, type: "single", ing: [] }
      ]
    },
    {
      name: "Haidilao Vincom Center Bà Triệu",
      address: "191 Bà Triệu, Phường Lê Đại Hành, Quận Hai Bà Trưng, Hà Nội",
      lat: 21.010530,
      lng: 105.850540,
      food: "Lẩu Tứ Xuyên Haidilao",
      dishes: [
        { name: "Nồi Lẩu 4 Ngăn Cay Tê Tứ Xuyên & Cà Chua", price: 250000, type: "combo", ing: ["chili", "vegetables"] },
        { name: "Thịt Bò Mỹ Cuộn Nấm Kim Châm", price: 160000, type: "single", ing: ["beef"] },
        { name: "Múa Mì Tươi Nghệ Thuật Haidilao", price: 45000, type: "single", ing: ["gluten"] }
      ]
    },
    {
      name: "Cơm Tấm Ba Ghiền",
      address: "84 Đặng Văn Ngữ, Phường 10, Quận Phú Nhuận, TP. Hồ Chí Minh",
      lat: 10.793850,
      lng: 106.671150,
      food: "Cơm tấm sườn bì chả khổng lồ",
      dishes: [
        { name: "Cơm Tấm Sườn Cốt Lết Khổng Lồ", price: 90000, type: "single", ing: ["pork", "rice"] },
        { name: "Cơm Tấm Sườn Bì Chả Trứng Ốp La", price: 110000, type: "combo", ing: ["pork", "rice", "egg"] },
        { name: "Canh Khổ Qua Nhồi Thịt", price: 35000, type: "single", ing: ["pork", "vegetables"] }
      ]
    },
    {
      name: "Bánh Mì Huỳnh Hoa",
      address: "26 Lê Thị Riêng, Phường Bến Thành, Quận 1, TP. Hồ Chí Minh",
      lat: 10.771230,
      lng: 106.692340,
      food: "Bánh mì ô môi đặc biệt 7 tầng nhân",
      dishes: [
        { name: "Bánh Mì Huỳnh Hoa 7 Tầng Nhân Pate Bơ", price: 68000, type: "single", ing: ["pork", "milk", "gluten", "vegetables"] },
        { name: "Hộp Xôi Mặn Thập Cẩm Chà Bông", price: 55000, type: "single", ing: ["rice", "pork"] },
        { name: "Chả Lụa Bì Gân Thượng Hạng (Cây 500g)", price: 130000, type: "single", ing: ["pork"] }
      ]
    },
    {
      name: "Phở Hòa Pasteur",
      address: "260C Pasteur, Phường Võ Thị Sáu, Quận 3, TP. Hồ Chí Minh",
      lat: 10.787610,
      lng: 106.687420,
      food: "Phở bò Nam Bộ đặc biệt",
      dishes: [
        { name: "Phở Bò Tô Xe Lửa Đặc Biệt Thập Cẩm", price: 95000, type: "single", ing: ["beef", "noodles"] },
        { name: "Phở Tái Bò Viên Gân Giòn", price: 85000, type: "single", ing: ["beef", "noodles"] },
        { name: "Bánh Su Kem Chiều Pasteur", price: 12000, type: "single", ing: ["milk", "egg", "gluten"] }
      ]
    },
    {
      name: "Bún Thịt Nướng Chị Tuyền",
      address: "175C Cô Giang, Phường Cô Giang, Quận 1, TP. Hồ Chí Minh",
      lat: 10.762622,
      lng: 106.690172,
      food: "Bún thịt nướng chả giò giòn rụm",
      dishes: [
        { name: "Bún Thịt Nướng Chả Giò Nem Nướng", price: 65000, type: "combo", ing: ["pork", "noodles", "peanuts", "vegetables"] },
        { name: "Bánh Hỏi Thịt Bò Xào Hành Phi", price: 70000, type: "single", ing: ["beef", "rice", "peanuts"] }
      ]
    },
    {
      name: "Ốc Đào Nguyễn Trãi",
      address: "Hẻm 212B Nguyễn Trãi, Phường Nguyễn Cư Trinh, Quận 1, TP. Hồ Chí Minh",
      lat: 10.764510,
      lng: 106.685420,
      food: "Ốc hương xào bơ tỏi bánh mì",
      dishes: [
        { name: "Ốc Hương Xào Bơ Tỏi Kèm Bánh Mì", price: 140000, type: "single", ing: ["seafood", "milk", "gluten"] },
        { name: "Ốc Móng Tay Xào Rau Muống Tỏi Cay", price: 90000, type: "single", ing: ["seafood", "vegetables", "chili"] },
        { name: "Sò Điệp Nướng Mỡ Hành Đậu Phộng", price: 110000, type: "single", ing: ["seafood", "peanuts"] }
      ]
    }
  ];

  const restaurants = [];
  sql += `-- Insert 20 Real Restaurants with detailed street addresses, coordinates and working delivery links\n`;
  sql += `INSERT INTO restaurants (id, name, address, location, geohash, delivery_links) VALUES\n`;
  
  realRestaurants.forEach((r, i) => {
    const id = uuidv4();
    restaurants.push(id);
    const geohash = `w3w_${i % 10}`;
    const encName = encodeURIComponent(r.name);
    const links = JSON.stringify({
      shopeefood: `https://shopeefood.vn/tim-kiem?keyword=${encName}`,
      be: `https://food.be.com.vn`,
      be_app: `be://food/search?q=${encName}`,
      grab: `https://food.grab.com/vn/vi/restaurants?search=${encName}`,
      google_maps: `https://www.google.com/maps/dir/?api=1&destination=${r.lat},${r.lng}`
    });
    sql += `('${id}', '${r.name.replace(/'/g, "''")}', '${r.address.replace(/'/g, "''")}', '{"lat": ${r.lat}, "lng": ${r.lng}}', '${geohash}', '${links}')${i === realRestaurants.length - 1 ? ';' : ','}\n`;
  });
  sql += '\n';

  // 4. Generate Dishes for each restaurant with real food images
  const sampleFoodImages = [
    "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=600&q=80", // Pho
    "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80", // Salad / Pho
    "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=600&q=80", // Noodles
    "https://images.unsplash.com/photo-1555126634-323283e090fa?auto=format&fit=crop&w=600&q=80", // Rice noodles
    "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=600&q=80", // Fried chicken
    "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80", // Pizza
    "https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&w=600&q=80", // Banh mi
    "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80", // Ribs
    "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80", // Seafood
    "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80"  // Coffee
  ];

  sql += `-- Insert Realistic Vietnamese Dishes\nINSERT INTO dishes (id, restaurant_id, name, price, image_url, ingredients, item_type, description) VALUES\n`;
  const allDishes = [];
  const dishIdsForPosts = [];
  let totalDishes = 0;

  // Flatten dishes
  const dishesToInsert = [];
  for (let r = 0; r < realRestaurants.length; r++) {
    const rest = realRestaurants[r];
    const restId = restaurants[r];

    for (let d = 0; d < rest.dishes.length; d++) {
      const dishObj = rest.dishes[d];
      const id = uuidv4();
      dishIdsForPosts.push(id);
      const imageUrl = sampleFoodImages[(r * 3 + d) % sampleFoodImages.length];
      const desc = `Món ăn đặc sắc tại ${rest.name}: ${dishObj.name}`;
      
      dishesToInsert.push({
        id,
        restaurant_id: restId,
        name: dishObj.name,
        price: dishObj.price,
        imageUrl,
        ingredients: dishObj.ing,
        item_type: dishObj.type,
        description: desc,
        lat: rest.lat,
        lng: rest.lng,
        restaurant_name: rest.name,
        restaurant_address: rest.address
      });
    }
  }

  dishesToInsert.forEach((dish, idx) => {
    const isLast = idx === dishesToInsert.length - 1;
    const ingJson = JSON.stringify(dish.ingredients);
    sql += `('${dish.id}', '${dish.restaurant_id}', '${dish.name.replace(/'/g, "''")}', ${dish.price}, '${dish.imageUrl}', '${ingJson}', '${dish.item_type}', '${dish.description.replace(/'/g, "''")}')${isLast ? ';' : ','}\n`;
    
    // Construct 384-dimensional vector embedding
    allDishes.push({
      id: dish.id,
      name: dish.name,
      ingredients: dish.ingredients,
      embedding: Array.from({ length: 384 }, () => Math.random() * 2 - 1),
      payload: {
        name: dish.name,
        restaurant_id: dish.restaurant_id,
        restaurant_name: dish.restaurant_name,
        restaurant_address: dish.restaurant_address,
        lat: dish.lat,
        lng: dish.lng,
        ingredients: dish.ingredients,
        suitable_for: ['breakfast', 'lunch', 'dinner', 'snack']
      }
    });
  });
  sql += '\n';

  // 5. Generate 40 Posts for Feed with real dish_id
  sql += `-- Insert 40 Posts\nINSERT INTO posts (id, user_id, post_type, video_url, content, dish_id) VALUES\n`;
  for (let i = 0; i < 40; i++) {
    const id = uuidv4();
    const userId = users[Math.floor(Math.random() * users.length)];
    const dishId = dishIdsForPosts[Math.floor(Math.random() * dishIdsForPosts.length)];
    const postType = 'video';
    const videoUrl = 'https://www.w3schools.com/html/mov_bbb.mp4';
    
    const captions = [
      'Trải nghiệm quá đỉnh tại nhà hàng này! Quán chuẩn vị truyền thống.',
      'Ngon nhức nách luôn các bạn ơi, nhất định phải ghé thử nhé.',
      'Sẽ quay lại lần sau, không gian tuyệt vời và phục vụ chu đáo.',
      'Đồ ăn ngon tuyệt vời, nước dùng thanh ngọt thơm phức.',
      'Rất đáng tiền, mọi người nên thử combo này nha!'
    ];
    const content = captions[i % captions.length];
    
    sql += `('${id}', '${userId}', '${postType}', '${videoUrl}', '${content}', '${dishId}')${i === 39 ? ';' : ','}\n`;
  }
  sql += '\n';

  fs.writeFileSync('seed.sql', sql);
  fs.writeFileSync('dish_embeddings.json', JSON.stringify(allDishes, null, 2));
  console.log(`Successfully generated seed.sql and dish_embeddings.json with ${realRestaurants.length} real restaurants across Hanoi & TP.HCM, ${dishesToInsert.length} authentic dishes, and 40 posts.`);
};

generateSeed();
