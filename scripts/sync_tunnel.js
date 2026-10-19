const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('\x1b[36m======================================================\x1b[0m');
console.log('\x1b[33m   FOOD RECOMMEND - CLOUDFLARE TUNNEL AUTO SYNC       \x1b[0m');
console.log('\x1b[36m======================================================\x1b[0m');

// 1. Start docker-compose
console.log('\x1b[32m[1/3] Khởi động các dịch vụ Docker (Backend, DB, Cloudflare)...\x1b[0m');
try {
  execSync('docker compose up -d', { stdio: 'inherit' });
} catch (e) {
  console.error('\x1b[31m[LỖI] Không thể chạy docker compose: ' + e.message + '\x1b[0m');
}

// 2. Poll logs for trycloudflare URL
console.log('\x1b[32m[2/3] Đang tìm kiếm URL Cloudflare Tunnel...\x1b[0m');
let tunnelUrl = '';
for (let i = 0; i < 15; i++) {
  try {
    const logs = execSync('docker compose logs cloudflared', { encoding: 'utf8' });
    const match = logs.match(/https:\/\/[a-zA-Z0-9-]+\.trycloudflare\.com/g);
    if (match && match.length > 0) {
      // Pick the last matched URL in the logs
      tunnelUrl = match[match.length - 1];
      break;
    }
  } catch (_) {}
  execSync('node -e "setTimeout(() => {}, 1000)"');
}

// Fallback to active file if not found
const activeFile = path.join(__dirname, '..', 'ACTIVE_TUNNEL_URL.txt');
if (!tunnelUrl && fs.existsSync(activeFile)) {
  tunnelUrl = fs.readFileSync(activeFile, 'utf8').trim();
}

if (tunnelUrl) {
  console.log(`\x1b[32m[3/3] Đã phát hiện Public URL: ${tunnelUrl}\x1b[0m`);

  // Write to ACTIVE_TUNNEL_URL.txt
  fs.writeFileSync(activeFile, tunnelUrl, 'utf8');

  // Update frontend/lib/config/api_config.dart
  const apiConfigFile = path.join(__dirname, '..', 'frontend', 'lib', 'config', 'api_config.dart');
  if (fs.existsSync(apiConfigFile)) {
    let content = fs.readFileSync(apiConfigFile, 'utf8');
    content = content.replace(
      /static const String defaultTunnelUrl = '.*?';/,
      `static const String defaultTunnelUrl = '${tunnelUrl}';`
    );
    fs.writeFileSync(apiConfigFile, content, 'utf8');
    console.log(` -> Đã đồng bộ vào: ${apiConfigFile}`);
  }

  // Tự động đẩy URL mới lên GitHub để Mobile App tự lấy mà không cần rebuild APK
  try {
    execSync('git add ACTIVE_TUNNEL_URL.txt && git commit -m "chore: auto sync active tunnel url" && git push origin main', {
      stdio: 'ignore',
      cwd: path.join(__dirname, '..')
    });
    console.log(' -> Đã tự động cập nhật URL lên GitHub (App sẽ tự nhận khi mở)');
  } catch (_) {}

  console.log('\n\x1b[36m======================================================\x1b[0m');
  console.log('\x1b[32m ✅ TẤT CẢ DỊCH VỤ ĐÃ SẴN SÀNG HOẠT ĐỘNG!\x1b[0m');
  console.log('\x1b[33m 🌐 PUBLIC CLOUDFLARE URL:\x1b[0m');
  console.log(`    \x1b[1m\x1b[37m\x1b[44m ${tunnelUrl} \x1b[0m`);
  console.log('\x1b[33m 🏥 HEALTHCHECK ENDPOINT:\x1b[0m');
  console.log(`    ${tunnelUrl}/api/health`);
  console.log('\x1b[33m 📶 MẠNG NỘI BỘ (WI-FI LAN):\x1b[0m');
  console.log('    http://192.168.1.89:3000');
  console.log('\x1b[36m======================================================\n\x1b[0m');
} else {
  console.log('\x1b[31m❌ Chưa lấy được URL Cloudflare. Vui lòng kiểm tra Docker Desktop.\x1b[0m');
}
