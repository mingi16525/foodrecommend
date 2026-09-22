import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import '../../config/api_config.dart';

class PostGridScreen extends StatefulWidget {
  final String endpoint;
  final String title;

  const PostGridScreen({super.key, required this.endpoint, required this.title});

  @override
  State<PostGridScreen> createState() => _PostGridScreenState();
}

class _PostGridScreenState extends State<PostGridScreen> {
  List<dynamic> _items = [];
  bool _isLoading = true;
  int _page = 1;
  bool _hasMore = true;
  final ScrollController _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    _fetchPosts();
    _scrollController.addListener(() {
      if (_scrollController.position.pixels >= _scrollController.position.maxScrollExtent - 100 && !_isLoading && _hasMore) {
        _fetchPosts();
      }
    });
  }

  Future<void> _fetchPosts() async {
    if (_isLoading && _page > 1) return;
    setState(() => _isLoading = true);

    try {
      final response = await http.get(
        Uri.parse('${ApiConfig.baseUrl}/api/social${widget.endpoint}?page=$_page&limit=15'),
        headers: {
          'Authorization': 'Bearer ${ApiConfig.token}',
        },
      );
      if (response.statusCode == 200) {
        final data = json.decode(response.body)['data'] as List;
        setState(() {
          _items.addAll(data);
          _hasMore = data.length == 15;
          _page++;
        });
      }
    } catch (e) {
      debugPrint('Error fetching posts: $e');
    } finally {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(widget.title)),
      body: _items.isEmpty && !_isLoading
          ? const Center(child: Text('Không có dữ liệu'))
          : GridView.builder(
              controller: _scrollController,
              padding: const EdgeInsets.all(2),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 3,
                crossAxisSpacing: 2,
                mainAxisSpacing: 2,
                childAspectRatio: 9 / 16, // Typical TikTok/Reel ratio
              ),
              itemCount: _items.length + (_hasMore ? 1 : 0),
              itemBuilder: (context, index) {
                if (index == _items.length) {
                  return const Center(child: CircularProgressIndicator());
                }
                final item = _items[index];
                return Stack(
                  fit: StackFit.expand,
                  children: [
                    Image.network(
                      item['placeholder_url'] ?? 'https://images.unsplash.com/photo-1547496502-affa22d38842',
                      fit: BoxFit.cover,
                    ),
                    Positioned(
                      bottom: 5,
                      left: 5,
                      child: Row(
                        children: [
                          const Icon(Icons.play_arrow_outlined, color: Colors.white, size: 16),
                          const SizedBox(width: 2),
                          Text(
                            (item['likes'] ?? 0).toString(),
                            style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                          )
                        ],
                      ),
                    )
                  ],
                );
              },
            ),
    );
  }
}
