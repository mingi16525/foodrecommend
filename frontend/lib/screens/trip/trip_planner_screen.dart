import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import '../../config/api_config.dart';

class TripPlannerScreen extends StatefulWidget {
  final String groupName;

  const TripPlannerScreen({super.key, required this.groupName});

  @override
  State<TripPlannerScreen> createState() => _TripPlannerScreenState();
}

class _TripPlannerScreenState extends State<TripPlannerScreen> with SingleTickerProviderStateMixin {
  List<Map<String, dynamic>> _itinerary = [];
  bool _isLoading = false;
  bool _hasError = false;
  bool _isPremiumRequired = false;
  String _errorMessage = 'Không thể tải lịch trình.';
  late AnimationController _animationController;
  final TextEditingController _prefController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(vsync: this, duration: const Duration(milliseconds: 600));
    _fetchItinerary();
  }

  @override
  void dispose() {
    _animationController.dispose();
    _prefController.dispose();
    super.dispose();
  }

  Future<void> _fetchItinerary() async {
    setState(() {
      _isLoading = true;
      _hasError = false;
      _isPremiumRequired = false;
    });
    try {
      final response = await http.post(
        Uri.parse('${ApiConfig.baseUrl}/api/trip/plan'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ${ApiConfig.token}',
        },
        body: json.encode({
          'groupName': widget.groupName,
          'preferences': _prefController.text.isNotEmpty ? _prefController.text : 'Gợi ý lịch trình tự động'
        }),
      );
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (mounted) {
          setState(() {
            _itinerary = (data['data'] as List).map((e) => e as Map<String, dynamic>).toList();
            _isLoading = false;
          });
          _animationController.forward(from: 0.0);
        }
      } else {
        String msg = 'Không thể tải lịch trình.';
        bool reqPrem = response.statusCode == 403;
        try {
          final errBody = json.decode(response.body);
          final rawMsg = errBody['error'] ?? errBody['message'] ?? '';
          if (rawMsg.isNotEmpty) msg = rawMsg;
          if (rawMsg.toString().toLowerCase().contains('premium')) reqPrem = true;
        } catch (_) {}

        if (mounted) {
          setState(() {
            _isLoading = false;
            _hasError = true;
            _isPremiumRequired = reqPrem;
            _errorMessage = msg;
          });
        }
      }
    } catch (_) {
      if (mounted) setState(() { _isLoading = false; _hasError = true; });
    }
  }

  Future<void> _upgradeToPremium() async {
    final messenger = ScaffoldMessenger.of(context);
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
          const SnackBar(content: Text('Yêu cầu thanh toán MoMo thành công! Vui lòng hoàn tất để kích hoạt Premium.')),
        );
      } else {
        messenger.showSnackBar(
          SnackBar(content: Text('Không thể tạo đơn thanh toán: ${res.body}')),
        );
      }
    } catch (e) {
      messenger.showSnackBar(
        SnackBar(content: Text('Lỗi kết nối: $e')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[50],
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            expandedHeight: 250,
            pinned: true,
            flexibleSpace: FlexibleSpaceBar(
              title: Text('Lịch Trình - ${widget.groupName}', 
                style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.white, shadows: [Shadow(blurRadius: 4, color: Colors.black54)]),
              ),
              background: Stack(
                fit: StackFit.expand,
                children: [
                  Image.network(
                    'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?auto=format&fit=crop&q=80',
                    fit: BoxFit.cover,
                  ),
                  Container(
                    decoration: const BoxDecoration(
                      gradient: LinearGradient(
                        colors: [Colors.transparent, Colors.black87],
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            actions: [
              IconButton(icon: const Icon(Icons.share, color: Colors.white), onPressed: () {}),
            ],
          ),
          if (_isLoading)
            const SliverFillRemaining(
              child: Center(child: CircularProgressIndicator()),
            )
          else if (_hasError)
            SliverFillRemaining(
              child: Center(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 24.0),
                  child: _isPremiumRequired
                      ? Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Icon(Icons.workspace_premium, size: 64, color: Colors.amber),
                            const SizedBox(height: 16),
                            const Text(
                              'Đặc Quyền Dành Cho Gói PREMIUM',
                              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                              textAlign: TextAlign.center,
                            ),
                            const SizedBox(height: 12),
                            const Text(
                              'Tính năng gợi ý lịch trình ẩm thực đa ngày tự động bằng AI Deep Tier chỉ dành riêng cho thành viên PREMIUM.\n\nNâng cấp ngay với giá chỉ 50.000đ/tháng để trải nghiệm không giới hạn!',
                              textAlign: TextAlign.center,
                              style: TextStyle(fontSize: 14, color: Colors.black87, height: 1.4),
                            ),
                            const SizedBox(height: 24),
                            ElevatedButton.icon(
                              style: ElevatedButton.styleFrom(
                                backgroundColor: Colors.orange,
                                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
                              ),
                              icon: const Icon(Icons.upgrade, color: Colors.white),
                              label: const Text('Nâng cấp qua MoMo (50.000đ)', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white)),
                              onPressed: _upgradeToPremium,
                            ),
                          ],
                        )
                      : Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Icon(Icons.error_outline, size: 48, color: Colors.redAccent),
                            const SizedBox(height: 16),
                            Text(_errorMessage, style: const TextStyle(fontSize: 16), textAlign: TextAlign.center),
                            const SizedBox(height: 12),
                            TextButton(onPressed: _fetchItinerary, child: const Text('Thử lại')),
                          ],
                        ),
                ),
              ),
            )
          else if (_itinerary.isEmpty)
            const SliverFillRemaining(
              child: Center(child: Text('Chưa có lịch trình. Hãy tạo mới!')),
            )
          else
            SliverPadding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 24),
              sliver: SliverList(
                delegate: SliverChildBuilderDelegate(
                  (context, index) {
                    final item = _itinerary[index];
                    final isLast = index == _itinerary.length - 1;
                    final isFood = item['type'] == 'food';
                    
                    final animation = Tween<double>(begin: 0.0, end: 1.0).animate(
                      CurvedAnimation(
                        parent: _animationController,
                        curve: Interval((index / _itinerary.length) * 0.5, 1.0, curve: Curves.easeOutQuart),
                      ),
                    );

                    return AnimatedBuilder(
                      animation: animation,
                      builder: (context, child) {
                        return Transform.translate(
                          offset: Offset(0, 50 * (1 - animation.value)),
                          child: Opacity(
                            opacity: animation.value,
                            child: child,
                          ),
                        );
                      },
                      child: IntrinsicHeight(
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            // Timeline indicator
                            SizedBox(
                              width: 60,
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.start,
                                children: [
                                  const SizedBox(height: 12),
                                  Text(item['time'].split(' ')[0], style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                                  if (item['time'].contains(' '))
                                    Text(item['time'].split(' ')[1], style: const TextStyle(fontSize: 12, color: Colors.grey)),
                                ],
                              ),
                            ),
                            Column(
                              children: [
                                const SizedBox(height: 14),
                                Container(
                                  width: 16,
                                  height: 16,
                                  decoration: BoxDecoration(
                                    shape: BoxShape.circle,
                                    color: isFood ? Colors.orangeAccent : Colors.lightBlueAccent,
                                    border: Border.all(color: Colors.white, width: 3),
                                    boxShadow: const [BoxShadow(color: Colors.black12, blurRadius: 4)],
                                  ),
                                ),
                                if (!isLast)
                                  Expanded(
                                    child: Container(
                                      width: 2,
                                      color: Colors.grey[300],
                                    ),
                                  ),
                              ],
                            ),
                            const SizedBox(width: 16),
                            // Card details
                            Expanded(
                              child: Padding(
                                padding: const EdgeInsets.only(bottom: 24.0),
                                child: Container(
                                  decoration: BoxDecoration(
                                    color: Colors.white,
                                    borderRadius: BorderRadius.circular(16),
                                    boxShadow: const [
                                      BoxShadow(color: Colors.black12, blurRadius: 10, offset: Offset(0, 4))
                                    ],
                                  ),
                                  child: Material(
                                    color: Colors.transparent,
                                    child: InkWell(
                                      borderRadius: BorderRadius.circular(16),
                                      onTap: () {},
                                      child: Padding(
                                        padding: const EdgeInsets.all(16.0),
                                        child: Column(
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          children: [
                                            Row(
                                              children: [
                                                Icon(
                                                  isFood ? Icons.fastfood : (item['type'] == 'meetup' ? Icons.people : Icons.local_activity),
                                                  color: isFood ? Colors.orangeAccent : Colors.lightBlueAccent,
                                                  size: 20,
                                                ),
                                                const SizedBox(width: 8),
                                                Expanded(
                                                  child: Text(
                                                    item['title'], 
                                                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
                                                  ),
                                                ),
                                              ],
                                            ),
                                            const SizedBox(height: 8),
                                            Row(
                                              children: [
                                                const Icon(Icons.location_on, size: 16, color: Colors.grey),
                                                const SizedBox(width: 4),
                                                Expanded(
                                                  child: Text(
                                                    item['location'],
                                                    style: TextStyle(color: Colors.grey[600]),
                                                  ),
                                                ),
                                              ],
                                            ),
                                          ],
                                        ),
                                      ),
                                    ),
                                  ),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                  childCount: _itinerary.length,
                ),
              ),
            ),
        ],
      ),
      bottomNavigationBar: Container(
        padding: EdgeInsets.only(
          bottom: MediaQuery.of(context).viewInsets.bottom + 10,
          left: 10,
          right: 10,
          top: 10,
        ),
        decoration: const BoxDecoration(
          color: Colors.white,
          boxShadow: [BoxShadow(color: Colors.black12, blurRadius: 4, offset: Offset(0, -2))],
        ),
        child: SafeArea(
          child: Row(
            children: [
              Expanded(
                child: TextField(
                  controller: _prefController,
                  decoration: InputDecoration(
                    hintText: 'Nhập ngữ cảnh (VD: Ăn lẩu, đi 4 người)...',
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(20),
                      borderSide: BorderSide.none,
                    ),
                    filled: true,
                    fillColor: Colors.grey[200],
                    contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                  ),
                  onSubmitted: (_) => _fetchItinerary(),
                ),
              ),
              const SizedBox(width: 8),
              CircleAvatar(
                backgroundColor: Colors.orange,
                child: IconButton(
                  icon: const Icon(Icons.send, color: Colors.white),
                  onPressed: _isLoading ? null : _fetchItinerary,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
