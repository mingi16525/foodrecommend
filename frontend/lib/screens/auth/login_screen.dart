import 'dart:convert';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:provider/provider.dart';
import '../../providers/app_state.dart';
import '../../services/auth_service.dart';
import '../../config/api_config.dart';
import 'register_screen.dart';
import 'otp_screen.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => LoginScreenState();
}

class LoginScreenState extends State<LoginScreen> {
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  final AuthService _authService = AuthService();
  bool _isLoading = false;

  void _login() async {
    setState(() => _isLoading = true);
    try {
      final response = await _authService.login(_emailController.text, _passwordController.text);
      
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('auth_token', response['token']);
      
      ApiConfig.token = response['token'];
      debugPrint('Logged in successfully: ${response['token']}');

      if (!mounted) return;
      
      Provider.of<AppState>(context, listen: false).login();
      // Navigate to Home or Tab 1 (Main UI) after login
      context.go('/');
    } catch (e) {
      if (!mounted) return;
      if (e.toString().contains('not verified')) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Tài khoản chưa được xác minh. Vui lòng nhập mã OTP.')));
        Navigator.of(context).push(
          MaterialPageRoute(builder: (context) => OtpScreen(email: _emailController.text)),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Login failed: $e')));
      }
    } finally {
      setState(() => _isLoading = false);
    }
  }

  void _showServerConfigDialog() {
    final TextEditingController urlController = TextEditingController(text: ApiConfig.baseUrl);
    String testStatus = '';
    bool isTesting = false;

    showDialog(
      context: context,
      builder: (dialogCtx) {
        return StatefulBuilder(
          builder: (context, setDialogState) {
            void testConnection() async {
              setDialogState(() {
                isTesting = true;
                testStatus = 'Đang kiểm tra kết nối...';
              });
              try {
                final client = HttpClient();
                client.badCertificateCallback = (cert, host, port) => true;
                client.connectionTimeout = const Duration(seconds: 5);
                final targetUrl = urlController.text.trim();
                final req = await client.getUrl(Uri.parse('$targetUrl/api/health'));
                final res = await req.close();
                final body = await res.transform(utf8.decoder).join();
                if (res.statusCode == 200) {
                  setDialogState(() {
                    testStatus = '✅ Kết nối thành công! ($targetUrl)';
                  });
                } else {
                  setDialogState(() {
                    testStatus = '⚠️ Máy chủ trả về HTTP ${res.statusCode}: $body';
                  });
                }
              } catch (e) {
                setDialogState(() {
                  testStatus = '❌ Lỗi kết nối: $e';
                });
              } finally {
                setDialogState(() {
                  isTesting = false;
                });
              }
            }

            return AlertDialog(
              title: const Row(
                children: [
                  Icon(Icons.dns, color: Colors.blue),
                  SizedBox(width: 8),
                  Text('Cấu hình Server API', style: TextStyle(fontSize: 18)),
                ],
              ),
              content: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Địa chỉ Backend hiện tại:', style: TextStyle(fontSize: 13, color: Colors.grey)),
                    const SizedBox(height: 8),
                    TextField(
                      controller: urlController,
                      decoration: const InputDecoration(
                        labelText: 'API Base URL',
                        border: OutlineInputBorder(),
                        isDense: true,
                      ),
                    ),
                    const SizedBox(height: 12),
                    const Text('Chọn nhanh cấu hình:', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 6),
                    Wrap(
                      spacing: 6,
                      runSpacing: 4,
                      children: [
                        ActionChip(
                          avatar: const Icon(Icons.sync, size: 16, color: Colors.blue),
                          label: const Text('Tự động tải từ GitHub', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                          onPressed: () async {
                            await ApiConfig.resetToAutoSync();
                            urlController.text = ApiConfig.baseUrl;
                          },
                        ),
                        ActionChip(
                          avatar: const Icon(Icons.cloud_outlined, size: 16),
                          label: const Text('Cloudflare Tunnel', style: TextStyle(fontSize: 11)),
                          onPressed: () {
                            urlController.text = ApiConfig.defaultTunnelUrl;
                          },
                        ),
                        ActionChip(
                          avatar: const Icon(Icons.wifi, size: 16),
                          label: const Text('Wi-Fi LAN PC (192.168.1.89)', style: TextStyle(fontSize: 11)),
                          onPressed: () {
                            urlController.text = ApiConfig.defaultLanUrl;
                          },
                        ),
                        ActionChip(
                          avatar: const Icon(Icons.phone_android, size: 16),
                          label: const Text('Android Emulator (10.0.2.2)', style: TextStyle(fontSize: 11)),
                          onPressed: () {
                            urlController.text = ApiConfig.defaultEmulatorUrl;
                          },
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    if (testStatus.isNotEmpty)
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: testStatus.startsWith('✅') ? Colors.green.shade50 : Colors.red.shade50,
                          borderRadius: BorderRadius.circular(6),
                          border: Border.all(
                            color: testStatus.startsWith('✅') ? Colors.green : Colors.red,
                          ),
                        ),
                        child: Text(
                          testStatus,
                          style: TextStyle(
                            fontSize: 12,
                            color: testStatus.startsWith('✅') ? Colors.green.shade900 : Colors.red.shade900,
                          ),
                        ),
                      ),
                  ],
                ),
              ),
              actions: [
                TextButton(
                  onPressed: isTesting ? null : testConnection,
                  child: isTesting
                      ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2))
                      : const Text('Kiểm tra Ping'),
                ),
                ElevatedButton(
                  onPressed: () async {
                    final newUrl = urlController.text.trim();
                    if (newUrl.isNotEmpty) {
                      final messenger = ScaffoldMessenger.of(context);
                      final nav = Navigator.of(dialogCtx);
                      await ApiConfig.setBaseUrl(newUrl);
                      nav.pop();
                      messenger.showSnackBar(
                        SnackBar(content: Text('Đã cập nhật Server: ${ApiConfig.baseUrl}')),
                      );
                      if (mounted) setState(() {});
                    }
                  },
                  child: const Text('Lưu & Dùng'),
                ),
              ],
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Đăng nhập'),
        actions: [
          IconButton(
            icon: const Icon(Icons.settings_ethernet),
            tooltip: 'Cấu hình Server API',
            onPressed: _showServerConfigDialog,
          ),
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            TextField(
              controller: _emailController,
              decoration: const InputDecoration(
                labelText: 'Email',
                border: OutlineInputBorder(),
              ),
              keyboardType: TextInputType.emailAddress,
            ),
            const SizedBox(height: 16),
            TextField(
              controller: _passwordController,
              decoration: const InputDecoration(
                labelText: 'Mật khẩu',
                border: OutlineInputBorder(),
              ),
              obscureText: true,
            ),
            const SizedBox(height: 20),
            _isLoading
                ? const CircularProgressIndicator()
                : ElevatedButton(
                    onPressed: _login,
                    style: ElevatedButton.styleFrom(
                      minimumSize: const Size(double.infinity, 50),
                    ),
                    child: const Text('Đăng nhập'),
                  ),
            TextButton(
              onPressed: () {
                Navigator.of(context).push(MaterialPageRoute(builder: (_) => const RegisterScreen()));
              },
              child: const Text('Chưa có tài khoản? Đăng ký ngay'),
            ),
            TextButton(
              onPressed: () {
                Provider.of<AppState>(context, listen: false).loginAsGuest();
                context.go('/');
              },
              child: const Text('Tiếp tục dưới dạng Khách', style: TextStyle(color: Colors.grey)),
            )
          ],
        ),
      ),
    );
  }
}
