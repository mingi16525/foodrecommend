import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import '../providers/app_state.dart';
import 'feed/feed_screen.dart';
import 'group/group_list_screen.dart';
import 'recommendation/recommendation_screen.dart';
import 'onboarding/onboarding_screen.dart';
import 'profile/profile_screen.dart';

class MainScreen extends StatefulWidget {
  const MainScreen({super.key});

  @override
  State<MainScreen> createState() => _MainScreenState();
}

class _MainScreenState extends State<MainScreen> {
  int _currentIndex = 0;

  final List<Widget> _screens = const [
    FeedScreen(),
    GroupListScreen(),
    RecommendationScreen(),
    OnboardingScreen(),
    ProfileScreen(),
  ];

  void _onTabTapped(int index) {
    setState(() {
      _currentIndex = index;
    });
  }

  Widget _buildBody(bool isGuest) {
    if (isGuest && (_currentIndex == 1 || _currentIndex == 3)) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.lock, size: 64, color: Colors.grey),
            const SizedBox(height: 16),
            const Text('Vui lòng đăng nhập để sử dụng tính năng này', style: TextStyle(fontSize: 16)),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: () {
                context.go('/login');
              },
              child: const Text('Đăng nhập'),
            )
          ],
        ),
      );
    }

    return IndexedStack(
      index: _currentIndex,
      children: _screens,
    );
  }

  @override
  Widget build(BuildContext context) {
    final isGuest = Provider.of<AppState>(context).isGuest;

    return Scaffold(
      body: _buildBody(isGuest),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        onTap: _onTabTapped,
        selectedItemColor: Colors.orange,
        unselectedItemColor: Colors.grey,
        type: BottomNavigationBarType.fixed,
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.video_library),
            label: 'Dành cho bạn',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.group),
            label: 'Cộng đồng',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.explore),
            label: 'Khám phá',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.restaurant_menu),
            label: 'Thiết lập',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.person),
            label: 'Tài khoản',
          ),
        ],
      ),
    );
  }
}
