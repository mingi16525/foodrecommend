import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import '../../config/api_config.dart';
import '../../services/api_logger.dart';

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
  final TextEditingController _customAllergyController =
      TextEditingController();

  final List<String> _diets = ['Bình thường', 'Keto', 'Ăn chay', 'Low-carb'];
  String _selectedDiet = 'Bình thường';

  final List<String> _dislikes = [];
  final TextEditingController _dislikeController = TextEditingController();

  bool _isSaving = false;
  bool _isLoadingPrefs = true;

  @override
  void initState() {
    super.initState();
    _loadPreferences();
  }

  Future<void> _loadPreferences() async {
    try {
      const url = '${ApiConfig.baseUrl}/api/users/me';
      final response = await http.get(
        Uri.parse(url),
        headers: {
          'Authorization': 'Bearer ${ApiConfig.token}',
        },
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        final prefs = data['preferences'];
        if (prefs != null && mounted) {
          setState(() {
            final flavors = prefs['favorite_flavors'] as List<dynamic>?;
            if (flavors != null) {
              for (final flavor in flavors) {
                final str = flavor.toString();
                if (str.startsWith('Cay:')) {
                  _spicyLevel =
                      double.tryParse(str.split(':')[1].trim()) ?? 0.5;
                } else if (str.startsWith('Mặn:')) {
                  _saltyLevel =
                      double.tryParse(str.split(':')[1].trim()) ?? 0.5;
                } else if (str.startsWith('Ngọt:')) {
                  _sweetLevel =
                      double.tryParse(str.split(':')[1].trim()) ?? 0.5;
                }
              }
            }

            final allergiesList = prefs['allergies'] as List<dynamic>?;
            if (allergiesList != null) {
              for (var a in allergiesList) {
                final allergy = a.toString();
                if (!_allergies.contains(allergy)) _allergies.add(allergy);
                if (!_selectedAllergies.contains(allergy)) {
                  _selectedAllergies.add(allergy);
                }
              }
            }

            final diets = prefs['dietary_restrictions'] as List<dynamic>?;
            if (diets != null && diets.isNotEmpty) {
              final diet = diets.first.toString();
              if (!_diets.contains(diet)) _diets.add(diet);
              _selectedDiet = diet;
            }

            final hated = prefs['hated_dishes'] as List<dynamic>?;
            if (hated != null) {
              for (var d in hated) {
                final dish = d.toString();
                if (!_dislikes.contains(dish)) _dislikes.add(dish);
              }
            }
          });
        }
      }
    } catch (e) {
      debugPrint('Error loading preferences: $e');
    } finally {
      if (mounted) {
        setState(() => _isLoadingPrefs = false);
      }
    }
  }

  Future<void> _savePreferences() async {
    setState(() => _isSaving = true);
    try {
      final payload = {
        'preferences': {
          'favorite_flavors': [
            'Cay: ${_spicyLevel.toStringAsFixed(1)}',
            'Mặn: ${_saltyLevel.toStringAsFixed(1)}',
            'Ngọt: ${_sweetLevel.toStringAsFixed(1)}'
          ],
          'allergies': _selectedAllergies,
          'dietary_restrictions': [_selectedDiet],
          'hated_dishes': _dislikes,
        }
      };

      const url = '${ApiConfig.baseUrl}/api/users/me/preferences';
      final response = await http.put(
        Uri.parse(url),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ${ApiConfig.token}',
        },
        body: json.encode(payload),
      );

      ApiLogger().addLog(
        method: 'PUT',
        url: url,
        requestBody: json.encode(payload),
        statusCode: response.statusCode,
        responseBody: response.body,
      );

      if (response.statusCode == 200) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Lưu thiết lập thành công!')),
          );
        }
      } else {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Lỗi từ máy chủ khi lưu.')),
          );
        }
      }
    } catch (e) {
      ApiLogger().addLog(
        method: 'PUT',
        url: '${ApiConfig.baseUrl}/api/users/me/preferences',
        requestBody: json.encode({
          'preferences': {
            'favorite_flavors': [
              'Cay: ${_spicyLevel.toStringAsFixed(1)}',
              'Mặn: ${_saltyLevel.toStringAsFixed(1)}',
              'Ngọt: ${_sweetLevel.toStringAsFixed(1)}'
            ],
            'allergies': _selectedAllergies,
            'dietary_restrictions': [_selectedDiet],
            'hated_dishes': _dislikes,
          }
        }),
        error: e.toString(),
      );
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
      body: _isLoadingPrefs
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Mức độ Cay, Mặn, Ngọt',
                      style:
                          TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 10),
                  _buildSlider('Độ Cay', _spicyLevel,
                      (val) => setState(() => _spicyLevel = val)),
                  _buildSlider('Độ Mặn', _saltyLevel,
                      (val) => setState(() => _saltyLevel = val)),
                  _buildSlider('Độ Ngọt', _sweetLevel,
                      (val) => setState(() => _sweetLevel = val)),
                  const Divider(height: 30),
                  const Text('Dị ứng',
                      style:
                          TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
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
                  const SizedBox(height: 10),
                  Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: _customAllergyController,
                          decoration: const InputDecoration(
                            hintText: 'Thêm dị ứng khác...',
                            border: OutlineInputBorder(),
                            contentPadding: EdgeInsets.symmetric(
                                horizontal: 10, vertical: 0),
                          ),
                        ),
                      ),
                      const SizedBox(width: 10),
                      ElevatedButton(
                        onPressed: () {
                          final newAllergy =
                              _customAllergyController.text.trim();
                          if (newAllergy.isNotEmpty &&
                              !_allergies.contains(newAllergy)) {
                            setState(() {
                              _allergies.add(newAllergy);
                              _selectedAllergies.add(newAllergy);
                            });
                            _customAllergyController.clear();
                          }
                        },
                        child: const Text('Thêm'),
                      )
                    ],
                  ),
                  const Divider(height: 30),
                  const Text('Chế độ ăn',
                      style:
                          TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
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
                  const Text('Món kỵ/ghét',
                      style:
                          TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 10),
                  Wrap(
                    spacing: 8.0,
                    children: _dislikes.map((item) {
                      return Chip(
                        label: Text(item),
                        onDeleted: () {
                          setState(() {
                            _dislikes.remove(item);
                          });
                        },
                      );
                    }).toList(),
                  ),
                  if (_dislikes.isNotEmpty) const SizedBox(height: 10),
                  TextField(
                    controller: _dislikeController,
                    decoration: InputDecoration(
                      hintText: 'Thêm món ăn bạn không thích...',
                      border: const OutlineInputBorder(),
                      suffixIcon: IconButton(
                        icon: const Icon(Icons.add),
                        onPressed: () {
                          final newDislike = _dislikeController.text.trim();
                          if (newDislike.isNotEmpty &&
                              !_dislikes.contains(newDislike)) {
                            setState(() {
                              _dislikes.add(newDislike);
                            });
                            _dislikeController.clear();
                          }
                        },
                      ),
                    ),
                    onSubmitted: (value) {
                      final newDislike = value.trim();
                      if (newDislike.isNotEmpty &&
                          !_dislikes.contains(newDislike)) {
                        setState(() {
                          _dislikes.add(newDislike);
                        });
                        _dislikeController.clear();
                      }
                    },
                  ),
                  const SizedBox(height: 30),
                  SizedBox(
                    width: double.infinity,
                    height: 50,
                    child: ElevatedButton(
                      onPressed: _isSaving ? null : _savePreferences,
                      child: _isSaving
                          ? const SizedBox(
                              height: 20,
                              width: 20,
                              child: CircularProgressIndicator(strokeWidth: 2))
                          : const Text('Lưu Thiết Lập'),
                    ),
                  ),
                ],
              ),
            ),
    );
  }

  Widget _buildSlider(
      String label, double value, ValueChanged<double> onChanged) {
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
