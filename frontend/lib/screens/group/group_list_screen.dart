import 'package:flutter/material.dart';
import 'group_chat_screen.dart';

class GroupListScreen extends StatefulWidget {
  const GroupListScreen({super.key});

  @override
  State<GroupListScreen> createState() => _GroupListScreenState();
}

class _GroupListScreenState extends State<GroupListScreen> {
  final List<Map<String, dynamic>> _groups = [
    {
      'id': '1',
      'name': 'Hội ăn nhậu cuối tuần',
      'members': 5,
      'last_message': 'Thứ 7 này ăn lẩu Thái nhé?',
      'time': '10:30 AM',
      'avatar': 'https://i.pravatar.cc/150?img=12'
    },
    {
      'id': '2',
      'name': 'Trưa nay ăn gì (Công ty)',
      'members': 12,
      'last_message': 'Đã chốt đơn Cơm Tấm Ba Ghi nha mọi người.',
      'time': 'Hôm qua',
      'avatar': 'https://i.pravatar.cc/150?img=33'
    },
    {
      'id': '3',
      'name': 'Gia đình nhỏ',
      'members': 4,
      'last_message': 'Chuyến đi Vũng Tàu sắp tới cần lên plan ăn uống.',
      'time': 'Thứ 2',
      'avatar': 'https://i.pravatar.cc/150?img=5'
    }
  ];

  void _showCreateGroupDialog() {
    final TextEditingController nameController = TextEditingController();
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text('Tạo nhóm mới'),
          content: TextField(
            controller: nameController,
            decoration: const InputDecoration(hintText: 'Nhập tên nhóm...'),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Hủy'),
            ),
            ElevatedButton(
              onPressed: () {
                if (nameController.text.isNotEmpty) {
                  setState(() {
                    _groups.insert(0, {
                      'id': DateTime.now().millisecondsSinceEpoch.toString(),
                      'name': nameController.text,
                      'members': 1,
                      'last_message': 'Nhóm vừa được tạo',
                      'time': 'Vừa xong',
                      'avatar': 'https://i.pravatar.cc/150?img=1'
                    });
                  });
                  Navigator.pop(context);
                }
              },
              child: const Text('Tạo'),
            ),
          ],
        );
      },
    );
  }


  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Cộng đồng & Nhóm (Tab 2)'),
        actions: [
          IconButton(
            icon: const Icon(Icons.add),
            onPressed: () {
              _showCreateGroupDialog();
            },
          )
        ],
      ),
      body: ListView.builder(
        itemCount: _groups.length,
        itemBuilder: (context, index) {
          final group = _groups[index];
          return ListTile(
            leading: CircleAvatar(
              radius: 25,
              backgroundImage: NetworkImage(group['avatar']),
            ),
            title: Text(group['name'], style: const TextStyle(fontWeight: FontWeight.bold)),
            subtitle: Text(
              group['last_message'],
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
            trailing: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text(group['time'], style: const TextStyle(color: Colors.grey, fontSize: 12)),
                const SizedBox(height: 5),
                Container(
                  padding: const EdgeInsets.all(4),
                  decoration: const BoxDecoration(
                    color: Colors.blueAccent,
                    shape: BoxShape.circle,
                  ),
                  child: Text(
                    '${group['members']}',
                    style: const TextStyle(color: Colors.white, fontSize: 10),
                  ),
                )
              ],
            ),
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => GroupChatScreen(groupName: group['name']),
                ),
              );
            },
          );
        },
      ),
    );
  }
}
