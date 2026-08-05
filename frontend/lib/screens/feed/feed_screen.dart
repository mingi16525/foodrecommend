import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import '../../config/api_config.dart';
import '../../widgets/video_player.dart';

class FeedScreen extends StatefulWidget {
  const FeedScreen({super.key});

  @override
  State<FeedScreen> createState() => _FeedScreenState();
}

class _FeedScreenState extends State<FeedScreen> {
  final PageController _pageController = PageController();
  List<dynamic> _feedItems = [];
  bool _isLoading = true;
  String _currentTab = 'Dành cho bạn';

  @override
  void initState() {
    super.initState();
    _fetchFeed();
  }

  Future<void> _fetchFeed() async {
    setState(() => _isLoading = true);
    try {
      final response = await http.get(
        Uri.parse('${ApiConfig.baseUrl}/api/social/feed'),
        headers: {
          'Authorization': 'Bearer ${ApiConfig.token}',
        },
      );
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        setState(() {
          _feedItems = data['data'] ?? [];
          _isLoading = false;
        });
      } else {
        _loadMockData();
      }
    } catch (e) {
      _loadMockData();
    }
  }

  void _loadMockData() {
    setState(() {
      _feedItems = [
        {
          'id': 1,
          'author_name': 'Foodie Hùng',
          'author_avatar': 'https://i.pravatar.cc/150?img=11',
          'is_verified': true,
          'caption': 'Quán phở ngon nhất quận 1, thịt bò mềm tan trong miệng 🤤',
          'video_url': 'mock_url_1',
          'placeholder_url': 'https://images.unsplash.com/photo-1547496502-affa22d38842',
          'likes': 1205,
          'comments': 45,
          'dish_name': 'Phở Bò Thập Cẩm',
          'price': 65000,
          'distance': '1.2km'
        },
        {
          'id': 2,
          'author_name': 'Thảo Trương',
          'author_avatar': 'https://i.pravatar.cc/150?img=5',
          'is_verified': false,
          'caption': 'Gà rán giòn rụm, sốt cay ngọt cực đỉnh!',
          'video_url': 'mock_url_2',
          'placeholder_url': 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec',
          'likes': 890,
          'comments': 22,
          'dish_name': 'Gà Rán Hàn Quốc',
          'price': 150000,
          'distance': '3.5km'
        }
      ];
      _isLoading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        children: [
          _isLoading
              ? const Center(child: CircularProgressIndicator(color: Colors.white))
              : PageView.builder(
                  controller: _pageController,
                  scrollDirection: Axis.vertical,
                  itemCount: _feedItems.length,
                  itemBuilder: (context, index) {
                    final item = _feedItems[index];
                    return _buildFeedItem(item);
                  },
                ),
          _buildHeader(),
        ],
      ),
    );
  }

  Widget _buildHeader() {
    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            _buildTab('Đang theo dõi'),
            const Text(' | ', style: TextStyle(color: Colors.white54, fontSize: 16)),
            _buildTab('Dành cho bạn'),
            const Text(' | ', style: TextStyle(color: Colors.white54, fontSize: 16)),
            _buildTab('Món hot'),
          ],
        ),
      ),
    );
  }

  Widget _buildTab(String title) {
    final isSelected = _currentTab == title;
    return GestureDetector(
      onTap: () => setState(() => _currentTab = title),
      child: Text(
        title,
        style: TextStyle(
          color: isSelected ? Colors.white : Colors.white54,
          fontSize: isSelected ? 18 : 16,
          fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
        ),
      ),
    );
  }

  Widget _buildFeedItem(dynamic item) {
    return Stack(
      fit: StackFit.expand,
      children: [
        CustomVideoPlayer(
          videoUrl: item['video_url'],
          placeholderImage: item['placeholder_url'],
        ),
        
        // Right side interaction buttons
        Positioned(
          right: 10,
          bottom: 120,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              _buildAvatar(item['author_avatar'], item['is_verified']),
              const SizedBox(height: 20),
              _buildInteractionButton(Icons.favorite, item['likes'].toString()),
              const SizedBox(height: 15),
              _buildInteractionButton(Icons.comment, item['comments'].toString()),
              const SizedBox(height: 15),
              _buildInteractionButton(Icons.bookmark, 'Lưu'),
              const SizedBox(height: 15),
              _buildInteractionButton(Icons.share, 'Chia sẻ'),
            ],
          ),
        ),
        
        // Bottom left details and Dish popup
        Positioned(
          left: 15,
          bottom: 20,
          right: 80,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                '@${item['author_name']}',
                style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16),
              ),
              const SizedBox(height: 8),
              Text(
                item['caption'],
                style: const TextStyle(color: Colors.white, fontSize: 14),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 15),
              // Smart Dish Popup
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.9),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.fastfood, color: Colors.orange),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(item['dish_name'], style: const TextStyle(fontWeight: FontWeight.bold)),
                          Text('${item['price']} đ • ${item['distance']}', style: const TextStyle(fontSize: 12, color: Colors.grey)),
                        ],
                      ),
                    ),
                    ElevatedButton(
                      onPressed: () {},
                      style: ElevatedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 0),
                        minimumSize: const Size(60, 30),
                        backgroundColor: Colors.orange,
                      ),
                      child: const Text('Thử ngay', style: TextStyle(fontSize: 12)),
                    )
                  ],
                ),
              ),
            ],
          ),
        )
      ],
    );
  }

  Widget _buildAvatar(String url, bool isVerified) {
    return Stack(
      clipBehavior: Clip.none,
      children: [
        CircleAvatar(
          radius: 25,
          backgroundImage: NetworkImage(url),
        ),
        if (isVerified)
          Positioned(
            bottom: -5,
            right: -5,
            child: Container(
              padding: const EdgeInsets.all(2),
              decoration: const BoxDecoration(
                color: Colors.white,
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.verified, color: Colors.blue, size: 16),
            ),
          ),
        Positioned(
          bottom: -10,
          left: 15,
          child: Container(
            padding: const EdgeInsets.all(2),
            decoration: const BoxDecoration(
              color: Colors.red,
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.add, color: Colors.white, size: 12),
          ),
        )
      ],
    );
  }

  Widget _buildInteractionButton(IconData icon, String text) {
    return Column(
      children: [
        Icon(icon, color: Colors.white, size: 35),
        const SizedBox(height: 4),
        Text(text, style: const TextStyle(color: Colors.white, fontSize: 12)),
      ],
    );
  }
}
