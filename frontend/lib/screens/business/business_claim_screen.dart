import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import '../../config/api_config.dart';
import 'business_menu_screen.dart';

class BusinessClaimScreen extends StatefulWidget {
  const BusinessClaimScreen({super.key});

  @override
  State<BusinessClaimScreen> createState() => _BusinessClaimScreenState();
}

class _BusinessClaimScreenState extends State<BusinessClaimScreen> {
  final TextEditingController _searchController = TextEditingController();
  List<dynamic> _searchResults = [];
  bool _isLoading = false;

  Future<void> _searchRestaurant() async {
    final query = _searchController.text.trim();
    if (query.isEmpty) return;

    setState(() {
      _isLoading = true;
    });

    try {
      final response = await http.get(
        Uri.parse('${ApiConfig.baseUrl}/api/restaurants/search?q=$query'),
      );
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (!mounted) return;
        setState(() {
          _searchResults = data['data'] ?? [];
        });
      } else {
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Không tìm thấy quán nào.')),
        );
      }
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Lỗi kết nối.')),
      );
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  Future<void> _claimRestaurant(String id, String name) async {
    try {
      final response = await http.post(
        Uri.parse('${ApiConfig.baseUrl}/api/restaurants/$id/claim'),
        headers: {
          'Authorization': 'Bearer ${ApiConfig.token}',
        },
      );
      if (response.statusCode == 200) {
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Đăng ký sở hữu $name thành công!')),
        );
        Navigator.push(
          context,
          MaterialPageRoute(builder: (context) => BusinessMenuScreen(restaurantId: id, restaurantName: name)),
        );
      } else {
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Không thể nhận quyền sở hữu. Quán có thể đã có chủ.')),
        );
      }
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Lỗi khi đăng ký.')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Nhận Quyền Sở Hữu Quán'),
        backgroundColor: Colors.orange,
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            const Text('Tìm kiếm quán ăn của bạn để quản lý menu và đơn hàng', style: TextStyle(fontSize: 16)),
            const SizedBox(height: 20),
            TextField(
              controller: _searchController,
              decoration: InputDecoration(
                hintText: 'Nhập tên quán...',
                suffixIcon: IconButton(
                  icon: const Icon(Icons.search),
                  onPressed: _searchRestaurant,
                ),
                border: const OutlineInputBorder(),
              ),
              onSubmitted: (_) => _searchRestaurant(),
            ),
            const SizedBox(height: 20),
            if (_isLoading) const CircularProgressIndicator(),
            Expanded(
              child: ListView.builder(
                itemCount: _searchResults.length,
                itemBuilder: (context, index) {
                  final restaurant = _searchResults[index];
                  return Card(
                    child: ListTile(
                      title: Text(restaurant['name'] ?? 'Quán mới'),
                      subtitle: Text(restaurant['address'] ?? ''),
                      trailing: ElevatedButton(
                        onPressed: () => _claimRestaurant(restaurant['id'], restaurant['name']),
                        style: ElevatedButton.styleFrom(backgroundColor: Colors.orange),
                        child: const Text('Nhận Quán'),
                      ),
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}
