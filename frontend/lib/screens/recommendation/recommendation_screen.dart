import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import '../../config/api_config.dart';
import '../../widgets/swipe_card.dart';
import '../../services/maps_service.dart';
import '../../services/delivery_link_service.dart';
class RecommendationScreen extends StatefulWidget {
  const RecommendationScreen({super.key});

  @override
  State<RecommendationScreen> createState() => _RecommendationScreenState();
}

class _RecommendationScreenState extends State<RecommendationScreen> {
  bool _isLoading = true;
  List<dynamic> _recommendations = [];

  @override
  void initState() {
    super.initState();
    _fetchRecommendations();
  }

  Future<void> _fetchRecommendations() async {
    setState(() => _isLoading = true);
    try {
      final response = await http.get(Uri.parse('${ApiConfig.baseUrl}/api/recommendation'));
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        setState(() {
          _recommendations = data['data'] ?? [];
          _isLoading = false;
        });
      } else {
        // Mock data fallback
        _loadMockData();
      }
    } catch (e) {
      _loadMockData();
    }
  }

  void _loadMockData() {
    setState(() {
      _recommendations = [
        {
          'id': 1,
          'name': 'Phở Bò Kobe',
          'restaurant_name': 'Phở Chú Long',
          'price': 85000,
          'image_url': 'https://images.unsplash.com/photo-1582878826629-29b7ad1cb438',
          'distance': '0.8km'
        },
        {
          'id': 2,
          'name': 'Cơm Tấm Sườn Bì',
          'restaurant_name': 'Cơm Tấm Ba Ghi',
          'price': 45000,
          'image_url': 'https://images.unsplash.com/photo-1626804475297-41609ea0ebb4',
          'distance': '1.5km'
        },
      ];
      _isLoading = false;
    });
  }

  void _onSwipe(bool isLiked) {
    if (_recommendations.isEmpty) return;
    final item = _recommendations.first;
    
    // Gửi sự kiện quẹt thẻ về backend
    http.post(
      Uri.parse('${ApiConfig.baseUrl}/api/recommendation/swipe'),
      headers: {'Content-Type': 'application/json'},
      body: json.encode({
        'dish_id': item['id'],
        'action': isLiked ? 'LIKE' : 'SKIP'
      }),
    ).catchError((_) {}); // Ignore errors in mock mode
    
    setState(() {
      _recommendations.removeAt(0);
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[100],
      appBar: AppBar(
        title: const Text('Khám phá (Tab 3)'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _fetchRecommendations,
          )
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _recommendations.isEmpty
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Text('Đã hết danh sách đề xuất.'),
                      const SizedBox(height: 20),
                      ElevatedButton(
                        onPressed: _fetchRecommendations,
                        child: const Text('Tải thêm'),
                      ),
                    ],
                  ),
                )
              : Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    children: [
                      Expanded(
                        child: Draggable<int>(
                          data: 1,
                          feedback: Material(
                            color: Colors.transparent,
                            child: SizedBox(
                              width: MediaQuery.of(context).size.width - 32,
                              height: MediaQuery.of(context).size.height * 0.6,
                              child: Opacity(
                                opacity: 0.8,
                                child: SwipeCard(dish: _recommendations.first),
                              ),
                            ),
                          ),
                          childWhenDragging: Container(
                            decoration: BoxDecoration(
                              color: Colors.grey[300],
                              borderRadius: BorderRadius.circular(20),
                            ),
                          ),
                          onDragEnd: (details) {
                            if (details.offset.dx > 100) {
                              _onSwipe(true); // Vuốt phải
                            } else if (details.offset.dx < -100) {
                              _onSwipe(false); // Vuốt trái
                            }
                          },
                          child: SwipeCard(dish: _recommendations.first),
                        ),
                      ),
                      const SizedBox(height: 20),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                        children: [
                          _buildActionButton(Icons.close, Colors.red, () => _onSwipe(false)),
                          _buildActionButton(Icons.favorite, Colors.green, () => _onSwipe(true)),
                          _buildActionButton(Icons.map, Colors.blue, () {
                            if (_recommendations.isNotEmpty) {
                              // Giả lập toạ độ (thực tế sẽ dùng toạ độ quán từ API)
                              MapsService.openMapsDirection(10.762622, 106.660172, _recommendations.first['restaurant_name']);
                            }
                          }), // Tích hợp Maps
                          _buildActionButton(Icons.delivery_dining, Colors.orange, () {
                            if (_recommendations.isNotEmpty) {
                              DeliveryLinkService.openGrabFood(_recommendations.first['restaurant_name']);
                            }
                          }), // Grab/Shopee
                        ],
                      ),
                      const SizedBox(height: 20),
                    ],
                  ),
                ),
    );
  }

  Widget _buildActionButton(IconData icon, Color color, VoidCallback onPressed) {
    return Container(
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: Colors.white,
        boxShadow: const [BoxShadow(color: Colors.black12, blurRadius: 8)],
      ),
      child: IconButton(
        icon: Icon(icon, color: color, size: 30),
        onPressed: onPressed,
      ),
    );
  }
}
