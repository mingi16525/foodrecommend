import 'package:flutter/material.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Tài khoản (Tab 5)'),
        actions: [
          IconButton(
            icon: const Icon(Icons.settings),
            onPressed: () {
              // TODO: Open Settings
            },
          )
        ],
      ),
      body: SingleChildScrollView(
        child: Column(
          children: [
            const SizedBox(height: 20),
            const CircleAvatar(
              radius: 50,
              backgroundImage: NetworkImage('https://i.pravatar.cc/150?img=32'),
            ),
            const SizedBox(height: 12),
            const Text(
              'Nguyễn Văn A',
              style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 4),
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
        _buildStatItem('120', 'Đánh giá'),
        _buildStatItem('45', 'Đã lưu'),
        _buildStatItem('8', 'Bài viết'),
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
