import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import '../../providers/app_state.dart';
import 'package:http/http.dart' as http;
import '../../config/api_config.dart';
import 'post_grid_screen.dart';
import '../business/business_claim_screen.dart';

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
  String _subscriptionTier = 'FREE';
  int _points = 0;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _fetchProfile();
  }

  Future<void> _fetchProfile() async {
    if (Provider.of<AppState>(context, listen: false).isGuest) {
      if (!mounted) return;
      setState(() {
        _userName = 'Khách (Guest)';
        _avatarUrl = 'https://i.pravatar.cc/150?img=0'; // default guest avatar
        _reviewsCount = 0;
        _savedCount = 0;
        _postsCount = 0;
        _isVerified = false;
        _subscriptionTier = 'FREE';
        _points = 0;
        _isLoading = false;
      });
      return;
    }

    try {
      final response = await http.get(
        Uri.parse('${ApiConfig.baseUrl}/api/users/me'),
        headers: {
          'Authorization': 'Bearer ${ApiConfig.token}',
        },
      );
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (!mounted) return;
        setState(() {
          _userName = _stringValue(data['full_name'] ?? data['name'], 'Khách');
          _avatarUrl = _stringValue(data['avatar'], 'https://i.pravatar.cc/150?img=32');
          _reviewsCount = _intValue(data['reviews_count']);
          _savedCount = _intValue(data['saved_count']);
          _postsCount = _intValue(data['posts_count']);
          _isVerified = data['is_reviewer'] == true || data['role'] == 'verified_reviewer';
          _subscriptionTier = (data['subscription_tier'] ?? 'FREE').toString().toUpperCase();
          _points = _intValue(data['points']);
          _isLoading = false;
          _errorMessage = null;
        });
      } else {
        if (!mounted) return;
        setState(() {
          _isLoading = false;
          _errorMessage = 'Không thể tải hồ sơ (${response.statusCode}).';
        });
      }
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _isLoading = false;
        _errorMessage = 'Không thể kết nối tới máy chủ hồ sơ.';
      });
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
                leading: const Icon(Icons.store),
                title: const Text('Quản lý Quán của tôi'),
                onTap: () {
                  Navigator.pop(context);
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (context) => const BusinessClaimScreen()),
                  );
                },
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
                  Provider.of<AppState>(context, listen: false).logout();
                  context.go('/login');
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

  void _showUpgradeDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Row(
          children: [
            Icon(Icons.workspace_premium, color: Colors.amber),
            SizedBox(width: 8),
            Text('Nâng cấp Premium VIP', style: TextStyle(fontSize: 18)),
          ],
        ),
        content: const Text(
          'Đặc quyền gói PREMIUM:\n'
          '• Mở khóa tạo nhóm ăn uống & chia bill thông minh\n'
          '• Thuật toán AI gợi ý lịch trình tự động\n'
          '• Đánh giá ưu tiên từ các reviewer chuyên nghiệp\n\n'
          'Giá ưu đãi: 50.000đ / tháng qua cổng MoMo / ZaloPay.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Hủy'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: Colors.orange),
            onPressed: () async {
              final messenger = ScaffoldMessenger.of(context);
              Navigator.pop(context);
              try {
                final res = await http.post(
                  Uri.parse('${ApiConfig.baseUrl}/api/subscriptions/upgrade'),
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ${ApiConfig.token}',
                  },
                  body: json.encode({'paymentMethod': 'momo'}),
                );
                if (res.statusCode == 200) {
                  messenger.showSnackBar(
                    const SnackBar(content: Text('Yêu cầu thanh toán MoMo thành công! Vui lòng hoàn tất thanh toán.')),
                  );
                }
              } catch (e) {
                messenger.showSnackBar(
                  SnackBar(content: Text('Lỗi kết nối cổng thanh toán: $e')),
                );
              }
            },
            child: const Text('Thanh toán MoMo'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Tài khoản (Tab 5)'),
        actions: [
          if (!Provider.of<AppState>(context).isGuest)
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
          : _errorMessage != null
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(_errorMessage!),
                      const SizedBox(height: 20),
                      ElevatedButton(onPressed: _fetchProfile, child: const Text('Thử lại')),
                    ],
                  ),
                )
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
                    const Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.verified, color: Colors.blue, size: 16),
                        SizedBox(width: 4),
                        Text('Verified Reviewer', style: TextStyle(color: Colors.grey)),
                      ],
                    ),
                  const SizedBox(height: 8),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: _subscriptionTier == 'PREMIUM' ? Colors.amber.shade100 : Colors.grey.shade200,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                            color: _subscriptionTier == 'PREMIUM' ? Colors.amber : Colors.grey.shade400,
                          ),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(
                              _subscriptionTier == 'PREMIUM' ? Icons.workspace_premium : Icons.person_outline,
                              size: 16,
                              color: _subscriptionTier == 'PREMIUM' ? Colors.amber.shade800 : Colors.grey.shade700,
                            ),
                            const SizedBox(width: 4),
                            Text(
                              _subscriptionTier == 'PREMIUM' ? 'PREMIUM VIP' : 'Gói Cơ Bản',
                              style: TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.bold,
                                color: _subscriptionTier == 'PREMIUM' ? Colors.amber.shade900 : Colors.grey.shade800,
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 10),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: Colors.orange.shade50,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: Colors.orange.shade300),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(Icons.stars, size: 16, color: Colors.orange),
                            const SizedBox(width: 4),
                            Text(
                              '$_points Điểm',
                              style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.deepOrange),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  if (_subscriptionTier != 'PREMIUM' && !Provider.of<AppState>(context).isGuest) ...[
                    const SizedBox(height: 12),
                    ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.amber.shade700,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                      ),
                      icon: const Icon(Icons.upgrade, size: 18),
                      label: const Text('Nâng cấp PREMIUM (50k/tháng)', style: TextStyle(fontWeight: FontWeight.bold)),
                      onPressed: _showUpgradeDialog,
                    ),
                  ],
                  const SizedBox(height: 24),
                  
                  _buildStatRow(),
                  const Divider(height: 40),
                  
                  if (Provider.of<AppState>(context).isGuest)
                    ElevatedButton(
                      onPressed: () {
                        context.go('/login');
                      },
                      child: const Text('Đăng nhập để xem thêm'),
                    )
                  else ...[
                    _buildListTile(Icons.favorite, 'Món đã thích', () {
                      Navigator.push(context, MaterialPageRoute(builder: (_) => const PostGridScreen(endpoint: '/feed/liked', title: 'Món đã thích')));
                    }),
                    _buildListTile(Icons.bookmark, 'Video đã lưu', () {
                      Navigator.push(context, MaterialPageRoute(builder: (_) => const PostGridScreen(endpoint: '/feed/saved', title: 'Video đã lưu')));
                    }),
                    _buildListTile(Icons.article, 'Bài viết đã đăng', () {
                      Navigator.push(context, MaterialPageRoute(builder: (_) => const PostGridScreen(endpoint: '/feed/my-posts', title: 'Bài viết đã đăng')));
                    }),
                    _buildListTile(Icons.link, 'Liên kết mạng xã hội', () {}),
                    
                    const Divider(height: 40),
                    _buildListTile(Icons.verified_user, 'Yêu cầu xác thực Reviewer', () {}),
                    _buildListTile(Icons.settings_system_daydream, 'Cài đặt hệ thống', () {}),
                  ]
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

  String _stringValue(dynamic value, String fallback) =>
      value is String && value.trim().isNotEmpty ? value : fallback;

  int _intValue(dynamic value) => value is int ? value : int.tryParse('$value') ?? 0;

  Widget _buildListTile(IconData icon, String title, VoidCallback onTap) {
    return ListTile(
      leading: Icon(icon),
      title: Text(title),
      trailing: const Icon(Icons.chevron_right),
      onTap: onTap,
    );
  }
}
