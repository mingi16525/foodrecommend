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

class _TripPlannerScreenState extends State<TripPlannerScreen> {
  List<Map<String, dynamic>> _itinerary = [];
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _fetchItinerary();
  }

  Future<void> _fetchItinerary() async {
    setState(() => _isLoading = true);
    try {
      final response = await http.post(
        Uri.parse('${ApiConfig.baseUrl}/api/trip/plan'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ${ApiConfig.token}',
        },
        body: json.encode({
          'groupName': widget.groupName,
          'preferences': 'Thích hải sản, không ăn cay' // Example preferences
        }),
      );
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (mounted) {
          setState(() {
            _itinerary = (data['data'] as List).map((e) => e as Map<String, dynamic>).toList();
            _isLoading = false;
          });
        }
      } else {
        if (mounted) setState(() => _isLoading = false);
      }
    } catch (_) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Lịch Trình - ${widget.groupName}'),
        actions: [
          IconButton(icon: const Icon(Icons.share), onPressed: () {}),
        ],
      ),
      body: Column(
        children: [
          // Khu vực Map mockup
          Container(
            height: 200,
            width: double.infinity,
            decoration: BoxDecoration(
              color: Colors.blue[100],
              image: const DecorationImage(
                image: NetworkImage('https://via.placeholder.com/800x400.png?text=Bản+đồ+Tuyến+Đường'),
                fit: BoxFit.cover,
              ),
            ),
            child: const Center(
              child: Text('Tích hợp Google Maps SDK (Pending)', 
                style: TextStyle(color: Colors.black54, fontWeight: FontWeight.bold, backgroundColor: Colors.white70)),
            ),
          ),
          
          const Padding(
            padding: EdgeInsets.all(16.0),
            child: Align(
              alignment: Alignment.centerLeft,
              child: Text('Lịch trình ăn chơi:', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            ),
          ),
          
          Expanded(
            child: _isLoading 
                ? const Center(child: CircularProgressIndicator())
                : _itinerary.isEmpty
                    ? const Center(child: Text('Chưa có lịch trình. Hãy thử tạo mới!'))
                    : ListView.builder(
              itemCount: _itinerary.length,
              itemBuilder: (context, index) {
                final item = _itinerary[index];
                final isLast = index == _itinerary.length - 1;
                
                return IntrinsicHeight(
                  child: Row(
                    children: [
                      // Timeline indicator
                      SizedBox(
                        width: 60,
                        child: Column(
                          children: [
                            Text(item['time'].split(' ')[0], style: const TextStyle(fontWeight: FontWeight.bold)),
                            Text(item['time'].split(' ')[1], style: const TextStyle(fontSize: 10, color: Colors.grey)),
                          ],
                        ),
                      ),
                      Column(
                        children: [
                          Container(
                            width: 16,
                            height: 16,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              color: item['type'] == 'food' ? Colors.orange : Colors.blue,
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
                      const SizedBox(width: 10),
                      // Card details
                      Expanded(
                        child: Padding(
                          padding: const EdgeInsets.only(bottom: 20.0),
                          child: Card(
                            elevation: 2,
                            child: ListTile(
                              leading: Icon(
                                item['type'] == 'food' ? Icons.fastfood : (item['type'] == 'meetup' ? Icons.people : Icons.local_activity),
                                color: item['type'] == 'food' ? Colors.orange : Colors.blue,
                              ),
                              title: Text(item['title'], style: const TextStyle(fontWeight: FontWeight.bold)),
                              subtitle: Text(item['location']),
                              trailing: IconButton(icon: const Icon(Icons.more_vert), onPressed: () {}),
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                );
              },
            ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {},
        child: const Icon(Icons.add),
      ),
    );
  }
}
