import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import '../../config/api_config.dart';

class BusinessMenuScreen extends StatefulWidget {
  final String restaurantId;
  final String restaurantName;

  const BusinessMenuScreen({super.key, required this.restaurantId, required this.restaurantName});

  @override
  State<BusinessMenuScreen> createState() => _BusinessMenuScreenState();
}

class _BusinessMenuScreenState extends State<BusinessMenuScreen> {
  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _priceController = TextEditingController();
  final TextEditingController _descController = TextEditingController();
  List<dynamic> _dishes = [];
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _fetchDishes();
  }

  Future<void> _fetchDishes() async {
    setState(() => _isLoading = true);
    try {
      final response = await http.get(Uri.parse('${ApiConfig.baseUrl}/api/restaurants/${widget.restaurantId}/dishes'));
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        setState(() {
          _dishes = data['data'] ?? [];
        });
      }
    } catch (e) {
      debugPrint('Error fetching dishes: $e');
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _addDish() async {
    final name = _nameController.text.trim();
    final price = int.tryParse(_priceController.text.trim()) ?? 0;
    final description = _descController.text.trim();

    if (name.isEmpty || price <= 0) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Vui lòng nhập tên và giá hợp lệ.')));
      return;
    }

    try {
      final response = await http.post(
        Uri.parse('${ApiConfig.baseUrl}/api/restaurants/${widget.restaurantId}/dishes'),
        headers: {
          'Authorization': 'Bearer ${ApiConfig.token}',
          'Content-Type': 'application/json',
        },
        body: json.encode({
          'name': name,
          'price': price,
          'description': description,
          'imageUrl': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c'
        }),
      );

      if (response.statusCode == 200) {
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Đã thêm món ăn!')));
        _nameController.clear();
        _priceController.clear();
        _descController.clear();
        _fetchDishes();
      } else {
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Không thể thêm món ăn.')));
      }
    } catch (e) {
      debugPrint('Error adding dish: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Menu - ${widget.restaurantName}'),
        backgroundColor: Colors.orange,
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            const Text('Thêm món mới vào menu', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
            const SizedBox(height: 10),
            TextField(controller: _nameController, decoration: const InputDecoration(labelText: 'Tên món ăn', border: OutlineInputBorder())),
            const SizedBox(height: 10),
            TextField(controller: _priceController, decoration: const InputDecoration(labelText: 'Giá (VND)', border: OutlineInputBorder()), keyboardType: TextInputType.number),
            const SizedBox(height: 10),
            TextField(controller: _descController, decoration: const InputDecoration(labelText: 'Mô tả (tuỳ chọn)', border: OutlineInputBorder())),
            const SizedBox(height: 10),
            ElevatedButton(
              onPressed: _addDish,
              style: ElevatedButton.styleFrom(backgroundColor: Colors.orange, minimumSize: const Size.fromHeight(50)),
              child: const Text('Thêm món', style: TextStyle(fontSize: 16)),
            ),
            const Divider(height: 40, thickness: 2),
            const Align(alignment: Alignment.centerLeft, child: Text('Menu hiện tại:', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16))),
            const SizedBox(height: 10),
            Expanded(
              child: _isLoading
                  ? const Center(child: CircularProgressIndicator())
                  : _dishes.isEmpty
                      ? const Center(child: Text('Chưa có món nào.'))
                      : ListView.builder(
                          itemCount: _dishes.length,
                          itemBuilder: (context, index) {
                            final dish = _dishes[index];
                            return Card(
                              child: ListTile(
                                leading: const Icon(Icons.fastfood, color: Colors.orange),
                                title: Text(dish['name'] ?? ''),
                                subtitle: Text('${dish['price']} VND'),
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
