import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:provider/provider.dart';
import '../providers/app_state.dart';
import '../config/api_config.dart';
import '../widgets/video_player.dart';

class FeedItemWidget extends StatefulWidget {
  final dynamic item;

  const FeedItemWidget({super.key, required this.item});

  @override
  State<FeedItemWidget> createState() => _FeedItemWidgetState();
}

class _FeedItemWidgetState extends State<FeedItemWidget> {
  late bool isLiked;
  late bool isSaved;
  late int likesCount;
  late int commentsCount;
  late int savesCount;

  @override
  void initState() {
    super.initState();
    isLiked = widget.item['is_liked'] ?? false;
    isSaved = widget.item['is_saved'] ?? false;
    likesCount = widget.item['likes'] ?? 0;
    commentsCount = widget.item['comments'] ?? 0;
    savesCount = widget.item['saves'] ?? 0;
  }

  Future<void> _toggleLike() async {
    final isGuest = Provider.of<AppState>(context, listen: false).isGuest;
    if (isGuest) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Vui lòng đăng nhập để thích video!')));
      return;
    }

    final String postId = widget.item['id']?.toString() ?? '';
    if (postId.isEmpty) return;

    setState(() {
      isLiked = !isLiked;
      likesCount += isLiked ? 1 : -1;
    });

    try {
      final response = await (isLiked ? http.post : http.delete)(
        Uri.parse('${ApiConfig.baseUrl}/api/social/posts/$postId/like'),
        headers: {'Authorization': 'Bearer ${ApiConfig.token}'},
      );
      if (response.statusCode != 200) {
        throw Exception('Failed to like/unlike');
      }
    } catch (e) {
      // Revert on failure
      setState(() {
        isLiked = !isLiked;
        likesCount += isLiked ? 1 : -1;
      });
    }
  }

  Future<void> _toggleSave() async {
    final isGuest = Provider.of<AppState>(context, listen: false).isGuest;
    if (isGuest) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Vui lòng đăng nhập để lưu video!')));
      return;
    }

    final String postId = widget.item['id']?.toString() ?? '';
    if (postId.isEmpty) return;

    setState(() {
      isSaved = !isSaved;
      savesCount += isSaved ? 1 : -1;
    });

    try {
      final response = await (isSaved ? http.post : http.delete)(
        Uri.parse('${ApiConfig.baseUrl}/api/social/posts/$postId/save'),
        headers: {'Authorization': 'Bearer ${ApiConfig.token}'},
      );
      if (response.statusCode != 200) {
        throw Exception('Failed to save/unsave');
      }
    } catch (e) {
      // Revert on failure
      setState(() {
        isSaved = !isSaved;
        savesCount += isSaved ? 1 : -1;
      });
    }
  }

  void _showComments() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => _CommentsBottomSheet(
        postId: widget.item['id']?.toString() ?? '',
        onCommentAdded: () {
          setState(() {
            commentsCount++;
          });
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Stack(
      fit: StackFit.expand,
      children: [
        CustomVideoPlayer(
          videoUrl: widget.item['video_url'] ?? '',
          placeholderImage: widget.item['placeholder_url'] ?? 'https://images.unsplash.com/photo-1547496502-affa22d38842',
        ),
        
        Positioned(
          right: 10,
          bottom: 120,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              _buildAvatar(widget.item['author_avatar'] ?? 'https://i.pravatar.cc/150', widget.item['is_verified'] ?? false),
              const SizedBox(height: 20),
              _buildInteractionButton(
                isLiked ? Icons.favorite : Icons.favorite_border,
                isLiked ? Colors.red : Colors.white,
                likesCount.toString(),
                _toggleLike,
              ),
              const SizedBox(height: 15),
              _buildInteractionButton(
                Icons.comment,
                Colors.white,
                commentsCount.toString(),
                _showComments,
              ),
              const SizedBox(height: 15),
              _buildInteractionButton(
                isSaved ? Icons.bookmark : Icons.bookmark_border,
                isSaved ? Colors.amber : Colors.white,
                'Lưu',
                _toggleSave,
              ),
              const SizedBox(height: 15),
              _buildInteractionButton(Icons.share, Colors.white, 'Chia sẻ', () {
                ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Tính năng chia sẻ đang phát triển')));
              }),
            ],
          ),
        ),
        
        Positioned(
          left: 15,
          bottom: 20,
          right: 80,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                '@${widget.item['author_name'] ?? 'Unknown'}',
                style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16),
              ),
              const SizedBox(height: 8),
              Text(
                widget.item['content'] ?? widget.item['caption'] ?? 'Chưa có nội dung',
                style: const TextStyle(color: Colors.white, fontSize: 14),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 15),
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.9),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.fastfood, color: Colors.orange),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(widget.item['dish_name'] ?? 'Món ăn đề xuất', style: const TextStyle(fontWeight: FontWeight.bold)),
                          Text('${widget.item['price'] ?? 'Liên hệ'} đ • ${widget.item['distance'] ?? ''}', style: const TextStyle(fontSize: 12, color: Colors.grey)),
                        ],
                      ),
                    ),
                    ElevatedButton(
                      onPressed: () {},
                      style: ElevatedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 0),
                        minimumSize: const Size(60, 30),
                        backgroundColor: Colors.orange,
                      ),
                      child: const Text('Thử ngay', style: TextStyle(fontSize: 12)),
                    )
                  ],
                ),
              ),
            ],
          ),
        )
      ],
    );
  }

  Widget _buildAvatar(String url, bool isVerified) {
    return Stack(
      clipBehavior: Clip.none,
      children: [
        CircleAvatar(
          radius: 25,
          backgroundImage: NetworkImage(url),
        ),
        if (isVerified)
          Positioned(
            bottom: -5,
            right: -5,
            child: Container(
              padding: const EdgeInsets.all(2),
              decoration: const BoxDecoration(
                color: Colors.white,
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.verified, color: Colors.blue, size: 16),
            ),
          ),
        Positioned(
          bottom: -10,
          left: 15,
          child: Container(
            padding: const EdgeInsets.all(2),
            decoration: const BoxDecoration(
              color: Colors.red,
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.add, color: Colors.white, size: 12),
          ),
        )
      ],
    );
  }

  Widget _buildInteractionButton(IconData icon, Color color, String text, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Column(
        children: [
          Icon(icon, color: color, size: 35),
          const SizedBox(height: 4),
          Text(text, style: const TextStyle(color: Colors.white, fontSize: 12)),
        ],
      ),
    );
  }
}

class _CommentsBottomSheet extends StatefulWidget {
  final String postId;
  final VoidCallback onCommentAdded;

  const _CommentsBottomSheet({required this.postId, required this.onCommentAdded});

  @override
  State<_CommentsBottomSheet> createState() => _CommentsBottomSheetState();
}

class _CommentsBottomSheetState extends State<_CommentsBottomSheet> {
  final List<dynamic> _comments = [];
  int _page = 1;
  bool _isLoading = false;
  bool _hasMore = true;
  final ScrollController _scrollController = ScrollController();
  final TextEditingController _textController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _fetchComments();
    _scrollController.addListener(() {
      if (_scrollController.position.pixels >= _scrollController.position.maxScrollExtent - 100 && !_isLoading && _hasMore) {
        _fetchComments();
      }
    });
  }

  Future<void> _fetchComments() async {
    if (_isLoading) return;
    setState(() => _isLoading = true);

    try {
      final response = await http.get(
        Uri.parse('${ApiConfig.baseUrl}/api/social/posts/${widget.postId}/comments?page=$_page&limit=10'),
      );
      if (response.statusCode == 200) {
        final data = json.decode(response.body)['data'] as List;
        setState(() {
          _comments.addAll(data);
          _hasMore = data.length == 10;
          _page++;
        });
      }
    } catch (e) {
      debugPrint('Error fetching comments: $e');
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _submitComment() async {
    final text = _textController.text.trim();
    if (text.isEmpty) return;

    final isGuest = Provider.of<AppState>(context, listen: false).isGuest;
    if (isGuest) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Vui lòng đăng nhập để bình luận!')));
      return;
    }

    _textController.clear();
    
    try {
      final response = await http.post(
        Uri.parse('${ApiConfig.baseUrl}/api/social/posts/${widget.postId}/comments'),
        headers: {
          'Authorization': 'Bearer ${ApiConfig.token}',
          'Content-Type': 'application/json',
        },
        body: json.encode({'commentText': text}),
      );

      if (response.statusCode == 200) {
        final newComment = json.decode(response.body)['data'];
        setState(() {
          _comments.insert(0, newComment);
        });
        widget.onCommentAdded();
      }
    } catch (e) {
      debugPrint('Error posting comment: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      height: MediaQuery.of(context).size.height * 0.65,
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      child: Column(
        children: [
          const SizedBox(height: 10),
          Container(width: 40, height: 5, decoration: BoxDecoration(color: Colors.grey[300], borderRadius: BorderRadius.circular(10))),
          const Padding(
            padding: EdgeInsets.symmetric(vertical: 15),
            child: Text('Bình luận', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
          ),
          const Divider(height: 1),
          Expanded(
            child: _comments.isEmpty && !_isLoading
                ? const Center(child: Text('Chưa có bình luận nào. Hãy là người đầu tiên!'))
                : ListView.builder(
                    controller: _scrollController,
                    itemCount: _comments.length + (_hasMore ? 1 : 0),
                    itemBuilder: (context, index) {
                      if (index == _comments.length) {
                        return const Padding(
                          padding: EdgeInsets.all(20),
                          child: Center(child: CircularProgressIndicator()),
                        );
                      }
                      final comment = _comments[index];
                      return ListTile(
                        leading: CircleAvatar(backgroundImage: NetworkImage(comment['author_avatar'] ?? 'https://i.pravatar.cc/150')),
                        title: Text(comment['author_name'] ?? 'User', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                        subtitle: Text(comment['comment_text'] ?? '', style: const TextStyle(fontSize: 14)),
                      );
                    },
                  ),
          ),
          Container(
            padding: EdgeInsets.only(bottom: MediaQuery.of(context).viewInsets.bottom, left: 10, right: 10, top: 10),
            decoration: BoxDecoration(
              color: Colors.white,
              border: Border(top: BorderSide(color: Colors.grey[200]!)),
            ),
            child: SafeArea(
              child: Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _textController,
                      decoration: InputDecoration(
                        hintText: 'Thêm bình luận...',
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(20), borderSide: BorderSide.none),
                        filled: true,
                        fillColor: Colors.grey[100],
                        contentPadding: const EdgeInsets.symmetric(horizontal: 15, vertical: 10),
                      ),
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.send, color: Colors.blue),
                    onPressed: _submitComment,
                  )
                ],
              ),
            ),
          )
        ],
      ),
    );
  }
}
