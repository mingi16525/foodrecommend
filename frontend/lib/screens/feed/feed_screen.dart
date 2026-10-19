import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:provider/provider.dart';
import '../../providers/app_state.dart';
import '../../config/api_config.dart';
import '../../widgets/feed_item_widget.dart';
import '../../services/location_service.dart';
import '../../services/api_logger.dart';
import 'create_post_screen.dart';

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
    
    final isGuest = Provider.of<AppState>(context, listen: false).isGuest;
    String queryParams = '';
    
    if (isGuest) {
      final position = await LocationService.getCurrentPosition();
      if (position != null) {
        queryParams = '?guest=true&lat=${position.latitude}&lng=${position.longitude}';
      } else {
        queryParams = '?guest=true';
      }
    }

    try {
      final response = await http.get(
        Uri.parse('${ApiConfig.baseUrl}/api/social/feed$queryParams'),
        headers: {
          if (!isGuest) 'Authorization': 'Bearer ${ApiConfig.token}',
        },
      );
      ApiLogger().addLog(
        method: 'GET',
        url: '${ApiConfig.baseUrl}/api/social/feed$queryParams',
        statusCode: response.statusCode,
        responseBody: response.body,
      );
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (!mounted) return;
        setState(() {
          _feedItems = data['data'] ?? [];
          _isLoading = false;
        });
      } else {
        if (!mounted) return;
        if (_feedItems.isEmpty) {
          _loadMockData();
        } else {
          setState(() => _isLoading = false);
        }
      }
    } catch (e) {
      ApiLogger().addLog(
        method: 'GET',
        url: '${ApiConfig.baseUrl}/api/social/feed$queryParams',
        error: e.toString(),
      );
      if (!mounted) return;
      if (_feedItems.isEmpty) {
        _loadMockData();
      } else {
        setState(() => _isLoading = false);
      }
    }
  }

  void _loadMockData() {
    if (!mounted) return;
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
              : RefreshIndicator(
                  color: Colors.orange,
                  backgroundColor: Colors.white,
                  onRefresh: _fetchFeed,
                  child: PageView.builder(
                    controller: _pageController,
                    scrollDirection: Axis.vertical,
                    physics: const AlwaysScrollableScrollPhysics(),
                    itemCount: _feedItems.length,
                    itemBuilder: (context, index) {
                      final item = _feedItems[index];
                      return _buildFeedItem(item);
                    },
                  ),
                ),
          _buildHeader(),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () async {
          final result = await Navigator.push(
            context,
            MaterialPageRoute(builder: (context) => const CreatePostScreen()),
          );
          if (result == true) {
            _fetchFeed();
          }
        },
        child: const Icon(Icons.add),
      ),
    );
  }

  Widget _buildHeader() {
    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        child: Row(
          children: [
            Expanded(
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
            IconButton(
              icon: const Icon(Icons.refresh, color: Colors.white70),
              tooltip: 'Tải lại',
              onPressed: _fetchFeed,
            ),
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
    final idKey = item['id']?.toString() ?? UniqueKey().toString();
    return FeedItemWidget(
      key: ValueKey(idKey),
      item: item,
    );
  }

}
