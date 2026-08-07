import 'dart:async';
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:url_launcher/url_launcher.dart';
import '../../config/api_config.dart';

class GroupOrderScreen extends StatefulWidget {
  final String groupId;
  const GroupOrderScreen({super.key, required this.groupId});

  @override
  State<GroupOrderScreen> createState() => _GroupOrderScreenState();
}

class _GroupOrderScreenState extends State<GroupOrderScreen> {
  Map<String, dynamic>? _activeOrder;
  bool _isLoading = true;
  Timer? _pollingTimer;
  String _myUserId = '';
  List<Map<String, dynamic>> _dishes = [];

  @override
  void initState() {
    super.initState();
    _fetchMyUserId().then((_) {
      _fetchActiveOrder();
      _pollingTimer = Timer.periodic(const Duration(seconds: 3), (_) {
        _fetchActiveOrder();
      });
    });
  }

  @override
  void dispose() {
    _pollingTimer?.cancel();
    super.dispose();
  }

  Future<void> _fetchMyUserId() async {
    try {
      final res = await http.get(
        Uri.parse('${ApiConfig.baseUrl}/api/users/me'),
        headers: {'Authorization': 'Bearer ${ApiConfig.token}'}
      );
      if (res.statusCode == 200) {
        final data = json.decode(res.body);
        if (mounted) setState(() => _myUserId = data['user']['id'] ?? '');
      }
    } catch (_) {}
  }

  Future<void> _fetchActiveOrder() async {
    try {
      final res = await http.get(
        Uri.parse('${ApiConfig.baseUrl}/api/groups/${widget.groupId}/orders/active'),
        headers: {'Authorization': 'Bearer ${ApiConfig.token}'}
      );
      if (res.statusCode == 200) {
        final data = json.decode(res.body)['data'];
        
        if (mounted) {
          setState(() {
            _activeOrder = data;
            _isLoading = false;
          });

          // Nếu chuyển sang trạng thái ORDERING và chưa load món
          if (data != null && data['status'] == 'ORDERING' && _dishes.isEmpty) {
            _loadDishes(data['selected_restaurant_id']);
          }
        }
      }
    } catch (_) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _loadDishes(String restaurantId) async {
    try {
      final res = await http.get(Uri.parse('${ApiConfig.baseUrl}/api/restaurants/$restaurantId/dishes'));
      if (res.statusCode == 200) {
        final data = json.decode(res.body)['data'] as List;
        if (mounted) {
          setState(() {
            _dishes = data.map((e) => e as Map<String, dynamic>).toList();
          });
        }
      }
    } catch (_) {}
  }

  Future<void> _createOrder() async {
    await http.post(
      Uri.parse('${ApiConfig.baseUrl}/api/groups/${widget.groupId}/orders'),
      headers: {'Authorization': 'Bearer ${ApiConfig.token}'}
    );
    _fetchActiveOrder();
  }

  Future<void> _joinOrder(String orderId) async {
    await http.post(
      Uri.parse('${ApiConfig.baseUrl}/api/groups/${widget.groupId}/orders/$orderId/join'),
      headers: {'Authorization': 'Bearer ${ApiConfig.token}'}
    );
    _fetchActiveOrder();
  }

  Future<void> _updateStatus(String orderId, String status, {String? restaurantId}) async {
    await http.post(
      Uri.parse('${ApiConfig.baseUrl}/api/groups/${widget.groupId}/orders/$orderId/status'),
      headers: {'Content-Type': 'application/json', 'Authorization': 'Bearer ${ApiConfig.token}'},
      body: json.encode({'status': status, 'restaurantId': restaurantId})
    );
    _fetchActiveOrder();
  }

  Future<void> _voteRestaurant(String orderId, String restaurantId) async {
    await http.post(
      Uri.parse('${ApiConfig.baseUrl}/api/groups/${widget.groupId}/orders/$orderId/vote'),
      headers: {'Content-Type': 'application/json', 'Authorization': 'Bearer ${ApiConfig.token}'},
      body: json.encode({'restaurantId': restaurantId})
    );
    _fetchActiveOrder();
  }

  Future<void> _addDish(String orderId, String dishId, double price) async {
    await http.post(
      Uri.parse('${ApiConfig.baseUrl}/api/groups/${widget.groupId}/orders/$orderId/items'),
      headers: {'Content-Type': 'application/json', 'Authorization': 'Bearer ${ApiConfig.token}'},
      body: json.encode({'dishId': dishId, 'quantity': 1, 'price': price})
    );
    _fetchActiveOrder();
  }

  Future<void> _launchShopeeFood() async {
    final Uri url = Uri.parse('https://shopeefood.vn/');
    if (!await launchUrl(url)) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Không thể mở app')));
      }
    }
  }

  int _getStepIndex(String status) {
    switch (status) {
      case 'PENDING': return 0;
      case 'VOTING': return 1;
      case 'ORDERING': return 2;
      case 'CLOSED': return 3;
      default: return 0;
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) return const Scaffold(body: Center(child: CircularProgressIndicator()));

    if (_activeOrder == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Tạo Đơn Nhóm')),
        body: Center(
          child: ElevatedButton.icon(
            onPressed: _createOrder,
            icon: const Icon(Icons.add_shopping_cart),
            label: const Text('Tạo phiên đặt đồ ăn chung'),
          ),
        ),
      );
    }

    final status = _activeOrder!['status'];
    final int currentStep = _getStepIndex(status);
    final isCreator = _activeOrder!['creator_id'] == _myUserId;
    
    final participants = (_activeOrder!['participants'] as List?) ?? [];
    final hasJoined = participants.any((p) => p['user_id'] == _myUserId);

    return Scaffold(
      appBar: AppBar(title: const Text('Đơn Nhóm (Trực tiếp)')),
      body: Stepper(
        type: StepperType.vertical,
        currentStep: currentStep,
        controlsBuilder: (context, details) => const SizedBox.shrink(), // Tắt nút mặc định
        steps: [
          _buildStep0Pending(currentStep, isCreator, participants, hasJoined),
          _buildStep1Voting(currentStep, isCreator),
          _buildStep2Ordering(currentStep, isCreator),
          _buildStep3Closed(currentStep),
        ],
      ),
    );
  }

  Step _buildStep0Pending(int currentStep, bool isCreator, List participants, bool hasJoined) {
    return Step(
      title: const Text('Tập hợp nhóm'),
      content: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Thành viên đã tham gia: ${participants.length}'),
          const SizedBox(height: 10),
          Wrap(
            spacing: 8,
            children: participants.map((p) => Chip(
              label: Text(p['full_name'] ?? 'Ẩn danh'),
              avatar: const Icon(Icons.person, size: 16),
            )).toList(),
          ),
          const SizedBox(height: 10),
          if (!hasJoined)
            ElevatedButton(
              onPressed: () => _joinOrder(_activeOrder!['id']),
              child: const Text('Tham gia đơn chung'),
            ),
          if (isCreator && currentStep == 0)
            ElevatedButton(
              onPressed: () => _updateStatus(_activeOrder!['id'], 'VOTING'),
              style: ElevatedButton.styleFrom(backgroundColor: Colors.orange),
              child: const Text('Bắt đầu bình chọn AI'),
            )
        ],
      ),
      isActive: currentStep >= 0,
      state: currentStep > 0 ? StepState.complete : StepState.indexed,
    );
  }

  Step _buildStep1Voting(int currentStep, bool isCreator) {
    final recs = (_activeOrder!['recommendations'] as List?) ?? [];
    final votes = (_activeOrder!['votes'] as List?) ?? [];

    return Step(
      title: const Text('AI đề xuất & Bình chọn quán'),
      content: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('AI phân tích khẩu vị nhóm và đề xuất top quán:'),
          if (recs.isEmpty && currentStep == 1) const CircularProgressIndicator(),
          ...recs.map((rec) {
            final resId = rec['id'];
            final voteCount = votes.firstWhere((v) => v['restaurant_id'] == resId, orElse: () => {'vote_count': '0'})['vote_count'];
            return ListTile(
              leading: const Icon(Icons.star, color: Colors.amber),
              title: Text(rec['name']),
              subtitle: Text('Borda Score: ${rec['bordaScore']}'),
              trailing: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text('$voteCount phiếu', style: const TextStyle(fontWeight: FontWeight.bold)),
                  const SizedBox(width: 8),
                  if (currentStep == 1)
                    OutlinedButton(
                      onPressed: () => _voteRestaurant(_activeOrder!['id'], resId),
                      child: const Text('Chọn'),
                    ),
                  if (isCreator && currentStep == 1)
                    IconButton(
                      icon: const Icon(Icons.check_circle, color: Colors.green),
                      onPressed: () => _updateStatus(_activeOrder!['id'], 'ORDERING', restaurantId: resId),
                      tooltip: 'Chốt quán này',
                    )
                ],
              ),
            );
          }),
        ],
      ),
      isActive: currentStep >= 1,
      state: currentStep > 1 ? StepState.complete : StepState.indexed,
    );
  }

  Step _buildStep2Ordering(int currentStep, bool isCreator) {
    final items = (_activeOrder!['items'] as List?) ?? [];
    
    return Step(
      title: const Text('Chọn món cá nhân'),
      content: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (currentStep == 2 && _dishes.isEmpty) const CircularProgressIndicator(),
          
          const Text('Các món đã được nhóm chọn:', style: TextStyle(fontWeight: FontWeight.bold)),
          ...items.map((i) => ListTile(
            title: Text('${i['dish_name']} (x${i['quantity']})'),
            subtitle: Text('Người chọn: ${i['user_name']}'),
            trailing: Text('${i['price']} đ'),
          )),
          const Divider(),
          const Text('Thực đơn quán:', style: TextStyle(fontWeight: FontWeight.bold)),
          ..._dishes.map((dish) => ListTile(
            leading: CircleAvatar(backgroundImage: NetworkImage(dish['image_url'] ?? '')),
            title: Text(dish['name']),
            trailing: IconButton(
              icon: const Icon(Icons.add_circle, color: Colors.blue),
              onPressed: () => _addDish(_activeOrder!['id'], dish['id'], double.parse(dish['price']?.toString() ?? '0')),
            ),
          )),
          if (isCreator && currentStep == 2)
            Padding(
              padding: const EdgeInsets.only(top: 10),
              child: ElevatedButton(
                onPressed: () => _updateStatus(_activeOrder!['id'], 'CLOSED'),
                style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
                child: const Text('Chốt đơn & Thanh toán', style: TextStyle(color: Colors.white)),
              ),
            )
        ],
      ),
      isActive: currentStep >= 2,
      state: currentStep > 2 ? StepState.complete : StepState.indexed,
    );
  }

  Step _buildStep3Closed(int currentStep) {
    final total = _activeOrder!['total_amount'] ?? 0;
    return Step(
      title: const Text('Chốt đơn & Đặt món'),
      content: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Tổng hóa đơn nhóm: $total đ', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.red)),
          const SizedBox(height: 10),
          const Text('Nhấn Tiếp tục để mở app ShopeeFood/GrabFood với đơn hàng đã tạo sẵn.'),
          const SizedBox(height: 10),
          ElevatedButton.icon(
            onPressed: _launchShopeeFood,
            icon: const Icon(Icons.delivery_dining),
            label: const Text('Mở Ứng dụng Giao Hàng'),
          )
        ],
      ),
      isActive: currentStep >= 3,
      state: currentStep > 3 ? StepState.complete : StepState.indexed,
    );
  }
}
