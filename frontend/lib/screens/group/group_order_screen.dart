import 'package:flutter/material.dart';

class GroupOrderScreen extends StatefulWidget {
  const GroupOrderScreen({super.key});

  @override
  State<GroupOrderScreen> createState() => _GroupOrderScreenState();
}

class _GroupOrderScreenState extends State<GroupOrderScreen> {
  int _currentStep = 0;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Tạo Đơn Nhóm'),
      ),
      body: Stepper(
        type: StepperType.vertical,
        currentStep: _currentStep,
        onStepContinue: () {
          if (_currentStep < 3) {
            setState(() => _currentStep += 1);
          } else {
            // Hoàn thành 4 bước -> Chốt đơn
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('Đang chuyển hướng sang ShopeeFood...')),
            );
            Navigator.pop(context);
          }
        },
        onStepCancel: () {
          if (_currentStep > 0) {
            setState(() => _currentStep -= 1);
          } else {
            Navigator.pop(context);
          }
        },
        steps: [
          Step(
            title: const Text('Tập hợp nhóm'),
            content: const Text('Mời mọi người vào đơn nhóm chung. Đã có 4/5 người tham gia.'),
            isActive: _currentStep >= 0,
            state: _currentStep > 0 ? StepState.complete : StepState.indexed,
          ),
          Step(
            title: const Text('AI đề xuất & Bình chọn quán'),
            content: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('AI phân tích khẩu vị nhóm và đề xuất:'),
                ListTile(
                  leading: const Icon(Icons.star, color: Colors.amber),
                  title: const Text('Cơm Tấm Ba Ghi'),
                  trailing: ElevatedButton(onPressed: () {}, child: const Text('Bình chọn (3)')),
                ),
                ListTile(
                  leading: const Icon(Icons.star_border),
                  title: const Text('Phở Chú Long'),
                  trailing: OutlinedButton(onPressed: () {}, child: const Text('Bình chọn (1)')),
                ),
              ],
            ),
            isActive: _currentStep >= 1,
            state: _currentStep > 1 ? StepState.complete : StepState.indexed,
          ),
          Step(
            title: const Text('Chọn món cá nhân'),
            content: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Quán đã chốt: Cơm Tấm Ba Ghi'),
                const SizedBox(height: 10),
                const ListTile(
                  title: Text('Cơm Sườn Bì (x2)'),
                  subtitle: Text('Minh, You'),
                  trailing: Text('90.000 đ'),
                ),
                const ListTile(
                  title: Text('Cơm Sườn Chả (x2)'),
                  subtitle: Text('Hoa, Tuấn'),
                  trailing: Text('100.000 đ'),
                ),
                ElevatedButton.icon(
                  onPressed: () {},
                  icon: const Icon(Icons.add),
                  label: const Text('Thêm món của tôi'),
                )
              ],
            ),
            isActive: _currentStep >= 2,
            state: _currentStep > 2 ? StepState.complete : StepState.indexed,
          ),
          Step(
            title: const Text('Chốt đơn & Đặt món'),
            content: const Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Tổng hóa đơn: 190.000 đ', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                SizedBox(height: 10),
                Text('Nhấn Tiếp tục để mở app ShopeeFood/GrabFood với đơn hàng đã tạo sẵn.'),
              ],
            ),
            isActive: _currentStep >= 3,
            state: _currentStep > 3 ? StepState.complete : StepState.indexed,
          ),
        ],
      ),
    );
  }
}
