import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import '../../config/api_config.dart';

class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  double _spicyLevel = 0.5;
  double _saltyLevel = 0.5;
  double _sweetLevel = 0.5;

  final List<String> _allergies = ['Hải sản', 'Đậu phộng', 'Gluten', 'Sữa'];
  final List<String> _selectedAllergies = [];

  final List<String> _diets = ['Bình thường', 'Keto', 'Ăn chay', 'Low-carb'];
  String _selectedDiet = 'Bình thường';
  
  bool _isSaving = false;

  Future<void> _savePreferences() async {
    setState(() => _isSaving = true);
    try {
      final payload = {
        'preferences': {
          'spicy_level': _spicyLevel,
          'salty_level': _saltyLevel,
          'sweet_level': _sweetLevel,
          'allergies': _selectedAllergies,
          'diet': _selectedDiet,
        }
      };
      
      final response = await http.put(
        Uri.parse('${ApiConfig.baseUrl}/api/users/me/preferences'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode(payload),
      );
      
      if (response.statusCode == 200) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Lưu thiết lập thành công!')),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Có lỗi xảy ra khi lưu.')),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isSaving = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Thiết lập Khẩu vị (Tab 4)'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Mức độ Cay, Mặn, Ngọt', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 10),
            _buildSlider('Độ Cay', _spicyLevel, (val) => setState(() => _spicyLevel = val)),
            _buildSlider('Độ Mặn', _saltyLevel, (val) => setState(() => _saltyLevel = val)),
            _buildSlider('Độ Ngọt', _sweetLevel, (val) => setState(() => _sweetLevel = val)),
            const Divider(height: 30),

            const Text('Dị ứng', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 10),
            Wrap(
              spacing: 8.0,
              children: _allergies.map((allergy) {
                final isSelected = _selectedAllergies.contains(allergy);
                return FilterChip(
                  label: Text(allergy),
                  selected: isSelected,
                  onSelected: (selected) {
                    setState(() {
                      if (selected) {
                        _selectedAllergies.add(allergy);
                      } else {
                        _selectedAllergies.remove(allergy);
                      }
                    });
                  },
                );
              }).toList(),
            ),
            const Divider(height: 30),

            const Text('Chế độ ăn', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 10),
            Wrap(
              spacing: 8.0,
              children: _diets.map((diet) {
                final isSelected = _selectedDiet == diet;
                return ChoiceChip(
                  label: Text(diet),
                  selected: isSelected,
                  onSelected: (selected) {
                    if (selected) {
                      setState(() => _selectedDiet = diet);
                    }
                  },
                );
              }).toList(),
            ),
            const Divider(height: 30),
            
            const Text('Món kỵ/ghét', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 10),
            const TextField(
              decoration: InputDecoration(
                hintText: 'Thêm món ăn bạn không thích...',
                border: OutlineInputBorder(),
                suffixIcon: Icon(Icons.add),
              ),
            ),
            const SizedBox(height: 30),
            
            SizedBox(
              width: double.infinity,
              height: 50,
              child: ElevatedButton(
                onPressed: _isSaving ? null : _savePreferences,
                child: _isSaving 
                  ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2))
                  : const Text('Lưu Thiết Lập'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSlider(String label, double value, ValueChanged<double> onChanged) {
    return Row(
      children: [
        SizedBox(width: 80, child: Text(label)),
        Expanded(
          child: Slider(
            value: value,
            onChanged: onChanged,
          ),
        ),
      ],
    );
  }
}
