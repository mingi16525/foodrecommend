import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import '../../config/api_config.dart';
import '../auth/login_screen.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  bool _isLoading = true;
  String _userName = 'Đang tải...';
  String _avatarUrl = 'https://i.pravatar.cc/150?img=32';
  int _reviewsCount = 0;
  int _savedCount = 0;
  int _postsCount = 0;
  bool _isVerified = false;

  @override
  void initState() {
    super.initState();
    _fetchProfile();
  }

  Future<void> _fetchProfile() async {
    try {
      final response = await http.get(
        Uri.parse('${ApiConfig.baseUrl}/api/users/me'),
        headers: {
          'Authorization': 'Bearer ${ApiConfig.token}',
        },
      );
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        setState(() {
          _userName = data['name'] ?? 'Nguyễn Văn A';
          _avatarUrl = data['avatar'] ?? 'https://i.pravatar.cc/150?img=32';
          _reviewsCount = data['reviews_count'] ?? 120;
          _savedCount = data['saved_count'] ?? 45;
          _postsCount = data['posts_count'] ?? 8;
          _isVerified = data['role'] == 'verified_reviewer';
          _isLoading = false;
        });
      } else {
        setState(() => _isLoading = false);
      }
    } catch (e) {
      setState(() => _isLoading = false);
    }
  }

  void _showSettingsDialog() {
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text('Cài đặt'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              ListTile(
                leading: const Icon(Icons.person_outline),
                title: const Text('Chỉnh sửa hồ sơ'),
                onTap: () => Navigator.pop(context),
              ),
              ListTile(
                leading: const Icon(Icons.notifications_none),
                title: const Text('Thông báo'),
                onTap: () => Navigator.pop(context),
              ),
              ListTile(
                leading: const Icon(Icons.logout, color: Colors.red),
                title: const Text('Đăng xuất', style: TextStyle(color: Colors.red)),
                onTap: () {
                  Navigator.pop(context);
                  Navigator.pushReplacement(
                    context,
                    MaterialPageRoute(builder: (context) => const LoginScreen()),
                  );
                },
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Đóng'),
            ),
          ],
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Tài khoản (Tab 5)'),
        actions: [
          IconButton(
            icon: const Icon(Icons.settings),
            onPressed: () {
              _showSettingsDialog();
            },
          )
        ],
      ),
      body: _isLoading 
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              child: Column(
                children: [
                  const SizedBox(height: 20),
                  CircleAvatar(
                    radius: 50,
                    backgroundImage: NetworkImage(_avatarUrl),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    _userName,
                    style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 4),
                  if (_isVerified)
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: const [
                        Icon(Icons.verified, color: Colors.blue, size: 16),
                        SizedBox(width: 4),
                        Text('Verified Reviewer', style: TextStyle(color: Colors.grey)),
                      ],
                    ),
                  const SizedBox(height: 24),
                  
                  _buildStatRow(),
                  const Divider(height: 40),
                  
                  _buildListTile(Icons.favorite, 'Món đã thích', () {}),
                  _buildListTile(Icons.bookmark, 'Quán đã lưu', () {}),
                  _buildListTile(Icons.article, 'Bài viết đã đăng', () {}),
                  _buildListTile(Icons.link, 'Liên kết mạng xã hội', () {}),
                  
                  const Divider(height: 40),
                  _buildListTile(Icons.verified_user, 'Yêu cầu xác thực Reviewer', () {}),
                  _buildListTile(Icons.settings_system_daydream, 'Cài đặt hệ thống', () {}),
                ],
              ),
            ),
    );
  }

  Widget _buildStatRow() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
      children: [
        _buildStatItem('$_reviewsCount', 'Đánh giá'),
        _buildStatItem('$_savedCount', 'Đã lưu'),
        _buildStatItem('$_postsCount', 'Bài viết'),
      ],
    );
  }

  Widget _buildStatItem(String count, String label) {
    return Column(
      children: [
        Text(count, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
        const SizedBox(height: 4),
        Text(label, style: const TextStyle(color: Colors.grey)),
      ],
    );
  }

  Widget _buildListTile(IconData icon, String title, VoidCallback onTap) {
    return ListTile(
      leading: Icon(icon),
      title: Text(title),
      trailing: const Icon(Icons.chevron_right),
      onTap: onTap,
    );
  }
}
