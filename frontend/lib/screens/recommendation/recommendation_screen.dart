import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:provider/provider.dart';
import '../../providers/app_state.dart';
import '../../config/api_config.dart';
import '../../widgets/swipe_card.dart';
import '../../services/maps_service.dart';
import '../../services/delivery_link_service.dart';
import '../../services/api_logger.dart';
class RecommendationScreen extends StatefulWidget {
  const RecommendationScreen({super.key});

  @override
  State<RecommendationScreen> createState() => _RecommendationScreenState();
}

class _RecommendationScreenState extends State<RecommendationScreen> {
  bool _isLoading = true;
  List<dynamic> _recommendations = [];
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _fetchRecommendations();
  }

  Future<void> _fetchRecommendations() async {
    if (!mounted) return;
    setState(() => _isLoading = true);
    
    final isGuest = Provider.of<AppState>(context, listen: false).isGuest;
    String queryParams = '';
    
    if (isGuest) {
      if (!mounted) return;
      setState(() {
        _isLoading = false;
        _errorMessage = 'Vui lòng đăng nhập để xem đề xuất cá nhân.';
      });
      return;
    }

    try {
      final response = await http.get(
        Uri.parse('${ApiConfig.baseUrl}/api/recommendation$queryParams'),
        headers: {
          if (!isGuest) 'Authorization': 'Bearer ${ApiConfig.token}',
        },
      );
      ApiLogger().addLog(
        method: 'GET',
        url: '${ApiConfig.baseUrl}/api/recommendation$queryParams',
        statusCode: response.statusCode,
        responseBody: response.body,
      );
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (!mounted) return;
        setState(() {
          _recommendations = data['data'] ?? [];
          _isLoading = false;
          _errorMessage = null;
        });
      } else {
        if (!mounted) return;
        setState(() {
          _isLoading = false;
          _errorMessage = 'Không thể tải đề xuất (${response.statusCode}).';
        });
      }
    } catch (e) {
      ApiLogger().addLog(
        method: 'GET',
        url: '${ApiConfig.baseUrl}/api/recommendation$queryParams',
        error: e.toString(),
      );
      if (!mounted) return;
      setState(() {
        _isLoading = false;
        _errorMessage = 'Không thể kết nối tới máy chủ đề xuất.';
      });
    }
  }

  Future<void> _onSwipe(bool isLiked) async {
    if (_recommendations.isEmpty) return;
    final item = _recommendations.first;
    
    final isGuest = Provider.of<AppState>(context, listen: false).isGuest;
    
    if (isGuest) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Vui lòng đăng nhập để lưu thao tác!')),
      );
      return;
    } else {
      final requestBody = json.encode({
        'dishId': item['id'],
        'action': isLiked ? 'like' : 'skip'
      });
      try {
        final response = await http.post(
          Uri.parse('${ApiConfig.baseUrl}/api/recommendation/swipe'),
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ${ApiConfig.token}',
          },
          body: requestBody,
        );
        ApiLogger().addLog(
          method: 'POST',
          url: '${ApiConfig.baseUrl}/api/recommendation/swipe',
          requestBody: requestBody,
          statusCode: response.statusCode,
          responseBody: response.body,
        );
        if (response.statusCode < 200 || response.statusCode >= 300) {
          throw Exception('Swipe request failed: ${response.statusCode}');
        }
      } catch (e) {
        ApiLogger().addLog(
          method: 'POST',
          url: '${ApiConfig.baseUrl}/api/recommendation/swipe',
          requestBody: requestBody,
          error: e.toString(),
        );
        if (!mounted) return;
        setState(() => _recommendations.insert(0, item));
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Không thể lưu thao tác, vui lòng thử lại.')),
        );
        return;
      }

      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(isLiked ? 'Đã thích món ăn!' : 'Đã bỏ qua món ăn.'), duration: const Duration(milliseconds: 500)),
      );
    }

    if (!mounted) return;
    setState(() => _recommendations.removeAt(0));
    if (_recommendations.isEmpty) await _fetchRecommendations();
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
          : _errorMessage != null
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(_errorMessage!),
                      const SizedBox(height: 20),
                      ElevatedButton(onPressed: _fetchRecommendations, child: const Text('Thử lại')),
                    ],
                  ),
                )
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
                        child: Dismissible(
                          key: Key(_recommendations.first['id'].toString()),
                          direction: DismissDirection.horizontal,
                          onDismissed: (direction) {
                            if (direction == DismissDirection.endToStart) {
                              _onSwipe(false); // Vuốt trái (Skip)
                            } else if (direction == DismissDirection.startToEnd) {
                              _onSwipe(true); // Vuốt phải (Like)
                            }
                          },
                          background: Container(
                            alignment: Alignment.centerLeft,
                            padding: const EdgeInsets.only(left: 20.0),
                            decoration: BoxDecoration(
                              color: Colors.green,
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: const Icon(Icons.favorite, color: Colors.white, size: 40),
                          ),
                          secondaryBackground: Container(
                            alignment: Alignment.centerRight,
                            padding: const EdgeInsets.only(right: 20.0),
                            decoration: BoxDecoration(
                              color: Colors.red,
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: const Icon(Icons.close, color: Colors.white, size: 40),
                          ),
                          child: SizedBox(
                            width: MediaQuery.of(context).size.width - 32,
                            height: MediaQuery.of(context).size.height * 0.6,
                            child: SwipeCard(dish: _recommendations.first),
                          ),
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
      decoration: const BoxDecoration(
        shape: BoxShape.circle,
        color: Colors.white,
        boxShadow: [BoxShadow(color: Colors.black12, blurRadius: 8)],
      ),
      child: IconButton(
        icon: Icon(icon, color: color, size: 30),
        onPressed: onPressed,
      ),
    );
  }
}
