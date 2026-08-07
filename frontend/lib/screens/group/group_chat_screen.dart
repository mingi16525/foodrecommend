import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:socket_io_client/socket_io_client.dart' as socket_io;
import '../../config/api_config.dart';
import 'group_order_screen.dart';
import '../trip/trip_planner_screen.dart';

class GroupChatScreen extends StatefulWidget {
  final String groupId;
  final String groupName;

  const GroupChatScreen({super.key, required this.groupId, required this.groupName});

  @override
  State<GroupChatScreen> createState() => _GroupChatScreenState();
}

class _GroupChatScreenState extends State<GroupChatScreen> {
  List<Map<String, dynamic>> _messages = [];
  final TextEditingController _msgController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  socket_io.Socket? _socket;
  String _myUserId = '';

  @override
  void initState() {
    super.initState();
    _fetchMyUserId();
    _fetchHistory();
    _connectSocket();
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

  Future<void> _fetchHistory() async {
    try {
      final res = await http.get(
        Uri.parse('${ApiConfig.baseUrl}/api/groups/${widget.groupId}/messages'),
        headers: {'Authorization': 'Bearer ${ApiConfig.token}'}
      );
      if (res.statusCode == 200) {
        final data = json.decode(res.body);
        final list = (data['data'] as List).map((e) => e as Map<String, dynamic>).toList();
        if (mounted) {
          setState(() {
            _messages = list;
          });
          _scrollToBottom();
        }
      }
    } catch (_) {}
  }

  void _connectSocket() {
    _socket = socket_io.io(ApiConfig.baseUrl, <String, dynamic>{
      'transports': ['websocket'],
      'autoConnect': false,
      'auth': {'token': ApiConfig.token}
    });

    _socket!.connect();

    _socket!.onConnect((_) {
      debugPrint('Socket connected');
      _socket!.emit('join_group', widget.groupId);
    });

    _socket!.on('new_message', (data) {
      if (mounted) {
        setState(() {
          _messages.add(data as Map<String, dynamic>);
        });
        _scrollToBottom();
      }
    });

    _socket!.onDisconnect((_) => debugPrint('Socket disconnected'));
  }

  @override
  void dispose() {
    _socket?.emit('leave_group', widget.groupId);
    _socket?.disconnect();
    _socket?.dispose();
    _msgController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _sendMessage() {
    final text = _msgController.text.trim();
    if (text.isEmpty || _socket == null) return;
    
    _socket!.emit('send_message', {
      'groupId': widget.groupId,
      'message': text,
    });
    
    _msgController.clear();
  }

  void _scrollToBottom() {
    Future.delayed(const Duration(milliseconds: 100), () {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.groupName),
        actions: [
          IconButton(icon: const Icon(Icons.info_outline), onPressed: () {}),
        ],
      ),
      body: Column(
        children: [
          _buildSpecialWidgetsArea(context),
          const Divider(height: 1),
          Expanded(
            child: ListView.builder(
              controller: _scrollController,
              padding: const EdgeInsets.all(10),
              itemCount: _messages.length,
              itemBuilder: (context, index) {
                final msg = _messages[index];
                return _buildChatBubble(msg);
              },
            ),
          ),
          _buildInputArea(),
        ],
      ),
    );
  }

  Widget _buildSpecialWidgetsArea(BuildContext context) {
    return Container(
      color: Colors.grey[100],
      padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 15),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
        children: [
          _buildToolWidget(
            icon: Icons.restaurant_menu,
            label: 'Tạo Đơn Chung',
            color: Colors.orange,
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (context) => GroupOrderScreen(groupId: widget.groupId)),
              );
            },
          ),
          _buildToolWidget(
            icon: Icons.map,
            label: 'Trip Planner',
            color: Colors.green,
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (context) => TripPlannerScreen(groupName: widget.groupName)),
              );
            },
          ),
        ],
      ),
    );
  }

  Widget _buildToolWidget({required IconData icon, required String label, required Color color, required VoidCallback onTap}) {
    return InkWell(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: color.withValues(alpha: 0.5)),
          boxShadow: [BoxShadow(color: color.withValues(alpha: 0.2), blurRadius: 4)],
        ),
        child: Row(
          children: [
            Icon(icon, color: color, size: 20),
            const SizedBox(width: 8),
            Text(label, style: TextStyle(color: color, fontWeight: FontWeight.bold)),
          ],
        ),
      ),
    );
  }

  Widget _buildChatBubble(Map<String, dynamic> msg) {
    final senderId = msg['sender_id'] as String?;
    final isMe = (senderId != null && senderId == _myUserId);
    
    return Align(
      alignment: isMe ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.symmetric(vertical: 5),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
        decoration: BoxDecoration(
          color: isMe ? Colors.blue[100] : Colors.grey[300],
          borderRadius: BorderRadius.circular(15),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (!isMe)
              Text(msg['sender_name'] ?? 'Unknown', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: Colors.black54)),
            if (!isMe) const SizedBox(height: 2),
            Text(msg['message'] ?? '', style: const TextStyle(fontSize: 15)),
          ],
        ),
      ),
    );
  }

  Widget _buildInputArea() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
      color: Colors.white,
      child: Row(
        children: [
          IconButton(icon: const Icon(Icons.add_circle_outline, color: Colors.blue), onPressed: () {}),
          Expanded(
            child: TextField(
              controller: _msgController,
              decoration: InputDecoration(
                hintText: 'Nhập tin nhắn...',
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(20), borderSide: BorderSide.none),
                filled: true,
                fillColor: Colors.grey[200],
                contentPadding: const EdgeInsets.symmetric(horizontal: 15, vertical: 10),
              ),
              onSubmitted: (_) => _sendMessage(),
            ),
          ),
          IconButton(
            icon: const Icon(Icons.send, color: Colors.blue),
            onPressed: _sendMessage,
          ),
        ],
      ),
    );
  }
}
