const { execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function runQuery(sql) {
  try {
    const cmd = `docker exec foodrecommend-postgres-1 psql -U fooduser -d foodrecommend -c "${sql}"`;
    execSync(cmd, { stdio: 'inherit' });
  } catch (err) {
    console.error('\x1b[31m[LỖI TRUY VẤN]\x1b[0m', err.message);
  }
}

function showMenu() {
  console.clear();
  console.log('\x1b[36m======================================================\x1b[0m');
  console.log('\x1b[33m  FOOD RECOMMEND - KIỂM TRA ĐỒNG BỘ CƠ SỞ DỮ LIỆU     \x1b[0m');
  console.log('\x1b[36m======================================================\x1b[0m');
  console.log(' \x1b[32m[1]\x1b[0m Kịch bản 1: 5 User mới & Trạng thái OTP (is_verified)');
  console.log(' \x1b[32m[2]\x1b[0m Kịch bản 2: Sở thích ăn uống & Dị ứng (user_preferences)');
  console.log(' \x1b[32m[3]\x1b[0m Kịch bản 3: 10 Lượt quẹt món gần nhất (user_swipes)');
  console.log(' \x1b[32m[4]\x1b[0m Kịch bản 4: 5 Bài review & Quán ăn liên kết (posts, restaurants)');
  console.log(' \x1b[32m[5]\x1b[0m Kịch bản 5: Quán đã claim & 5 Món ăn trong thực đơn (dishes)');
  console.log(' \x1b[32m[6]\x1b[0m Kịch bản 6: Nhóm ăn & Đơn hàng nhóm (groups, group_orders)');
  console.log(' \x1b[32m[7]\x1b[0m Tự gõ lệnh SQL (Mở psql terminal trực tiếp)');
  console.log(' \x1b[31m[0]\x1b[0m Thoát');
  console.log('\x1b[36m======================================================\x1b[0m');
  rl.question('Nhập lựa chọn của bạn [0-7]: ', handleInput);
}

function handleInput(choice) {
  const opt = choice.trim();
  console.log('');

  switch (opt) {
    case '1':
      console.log('\x1b[33m=== [KỊCH BẢN 1] 5 USER MỚI NHẤT & TRẠNG THÁI XÁC THỰC OTP ===\x1b[0m');
      runQuery("SELECT id, email, full_name, is_verified, created_at FROM users ORDER BY created_at DESC LIMIT 5;");
      break;

    case '2':
      console.log('\x1b[33m=== [KỊCH BẢN 2] HỒ SƠ SỞ THÍCH ĂN UỐNG & DỊ ỨNG MỚI NHẤT ===\x1b[0m');
      runQuery("SELECT u.email, p.favorite_flavors, p.allergies, p.dietary_restrictions, p.hated_dishes FROM user_preferences p JOIN users u ON p.user_id = u.id ORDER BY u.created_at DESC LIMIT 5;");
      break;

    case '3':
      console.log('\x1b[33m=== [KỊCH BẢN 3] 10 LƯỢT QUẸT MÓN MỚI NHẤT (USER_SWIPES) ===\x1b[0m');
      runQuery("SELECT s.id, u.email, d.name AS mon_an, s.action, s.created_at FROM user_swipes s JOIN users u ON s.user_id = u.id JOIN dishes d ON s.dish_id = d.id ORDER BY s.created_at DESC LIMIT 10;");
      break;

    case '4':
      console.log('\x1b[33m=== [KỊCH BẢN 4] 5 BÀI REVIEW VÀ QUÁN ĂN LIÊN KẾT ===\x1b[0m');
      runQuery("SELECT p.id, u.email, r.name AS quan_an, r.is_verified, p.content, p.created_at FROM posts p JOIN users u ON p.user_id = u.id LEFT JOIN restaurants r ON p.restaurant_id = r.id ORDER BY p.created_at DESC LIMIT 5;");
      break;

    case '5':
      console.log('\x1b[33m=== [KỊCH BẢN 5] QUÁN ĂN ĐÃ CLAIM & 5 MÓN ĂN TRONG THỰC ĐƠN ===\x1b[0m');
      runQuery("SELECT id, name, claimed_by, is_verified FROM restaurants WHERE claimed_by IS NOT NULL LIMIT 5;");
      runQuery("SELECT id, name, price, restaurant_id FROM dishes ORDER BY name ASC LIMIT 5;");
      break;

    case '6':
      console.log('\x1b[33m=== [KỊCH BẢN 6] DANH SÁCH NHÓM & ĐƠN HÀNG CHIA TIỀN ===\x1b[0m');
      runQuery("SELECT id, name, creator_id, created_at FROM groups ORDER BY created_at DESC LIMIT 5;");
      runQuery("SELECT id, group_id, status, total_amount, created_at FROM group_orders ORDER BY created_at DESC LIMIT 5;");
      break;

    case '7':
      try {
        execSync('docker exec -it foodrecommend-postgres-1 psql -U fooduser -d foodrecommend', { stdio: 'inherit' });
      } catch (_) {}
      break;

    case '0':
      console.log('Tạm biệt!');
      rl.close();
      process.exit(0);

    default:
      console.log('\x1b[31mLựa chọn không hợp lệ. Vui lòng nhập số từ 0 đến 7.\x1b[0m');
      break;
  }

  console.log('');
  rl.question('\x1b[36mNhấn Enter để quay lại Menu chính...\x1b[0m', () => {
    showMenu();
  });
}

showMenu();
