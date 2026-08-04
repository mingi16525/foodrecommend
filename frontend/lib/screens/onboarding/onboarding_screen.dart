import 'package:flutter/material.dart';

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
                onPressed: () {
                  // TODO: Save preferences via API
                },
                child: const Text('Lưu Thiết Lập'),
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
