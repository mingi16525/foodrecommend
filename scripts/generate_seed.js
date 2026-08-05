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
  
  // Test User
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

  // 3. Generate 50 Restaurants
  const restaurants = [];
  const foodTypes = ['Phở', 'Bún', 'Cơm', 'Lẩu', 'Nướng', 'Gà Rán', 'Pizza', 'Sushi', 'Mì', 'Trà Sữa'];
  sql += `-- Insert 50 Restaurants\nINSERT INTO restaurants (id, name, address, geohash, delivery_links) VALUES\n`;
  for (let i = 0; i < 50; i++) {
    const id = uuidv4();
    restaurants.push(id);
    const name = `${foodTypes[i % foodTypes.length]} Quán ${i}`;
    const lat = 21.0285 + (Math.random() - 0.5) * 0.1; // Hanoi approx
    const lng = 105.8542 + (Math.random() - 0.5) * 0.1;
    // Simple mock geohash logic
    const geohash = `w3w${i % 10}`;
    const links = `{"shopeefood": "link_${i}"}`;
    sql += `('${id}', '${name}', 'Address ${i}', '${geohash}', '${links}')${i === 49 ? ';' : ','}\n`;
  }
  sql += '\n';

  // 4. Generate 500 Dishes (10 per restaurant)
  const ingredientsList = ['beef', 'chicken', 'pork', 'fish', 'shrimp', 'noodles', 'rice', 'vegetables', 'chili', 'peanuts', 'milk', 'egg'];
  sql += `-- Insert 500 Dishes\nINSERT INTO dishes (id, restaurant_id, name, price, ingredients) VALUES\n`;
  let dishCount = 0;
  const allDishes = [];
  for (let r = 0; r < 50; r++) {
    const restId = restaurants[r];
    for (let d = 0; d < 10; d++) {
      const id = uuidv4();
      const name = `${foodTypes[r % foodTypes.length]} Món ${d}`;
      const price = Math.floor(Math.random() * 100) * 1000 + 20000;
      
      const ing1 = ingredientsList[Math.floor(Math.random() * ingredientsList.length)];
      const ing2 = ingredientsList[Math.floor(Math.random() * ingredientsList.length)];
      const ingredients = `["${ing1}", "${ing2}"]`;
      
      sql += `('${id}', '${restId}', '${name}', ${price}, '${ingredients}')${dishCount === 499 ? ';' : ','}\n`;
      dishCount++;
      
      // Keep track for embeddings
      allDishes.push({
        id: id,
        name: name,
        ingredients: [ing1, ing2],
        embedding: Array.from({length: 384}, () => Math.random() * 2 - 1)
      });
    }
  }
  sql += '\n';

  fs.writeFileSync('seed.sql', sql);
  fs.writeFileSync('dish_embeddings.json', JSON.stringify(allDishes, null, 2));
  console.log('Successfully generated seed.sql and dish_embeddings.json with 21 users, 50 restaurants, and 500 dishes.');
};

generateSeed();
