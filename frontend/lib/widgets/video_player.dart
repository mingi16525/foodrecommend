import 'package:flutter/material.dart';

class CustomVideoPlayer extends StatefulWidget {
  final String videoUrl;
  final String placeholderImage;

  const CustomVideoPlayer({
    super.key,
    required this.videoUrl,
    required this.placeholderImage,
  });

  @override
  State<CustomVideoPlayer> createState() => _CustomVideoPlayerState();
}

class _CustomVideoPlayerState extends State<CustomVideoPlayer> {
  bool _isPlaying = true;

  void _togglePlay() {
    setState(() {
      _isPlaying = !_isPlaying;
    });
  }

  @override
  Widget build(BuildContext context) {
    // Đây là mockup VideoPlayer do không cài đặt package video_player.
    // Thực tế sẽ dùng video_player package để phát videoUrl.
    return GestureDetector(
      onTap: _togglePlay,
      child: Stack(
        fit: StackFit.expand,
        children: [
          Image.network(
            widget.placeholderImage,
            fit: BoxFit.cover,
          ),
          Container(
            color: Colors.black.withOpacity(0.3),
          ),
          if (!_isPlaying)
            const Center(
              child: Icon(
                Icons.play_circle_outline,
                size: 80,
                color: Colors.white70,
              ),
            ),
        ],
      ),
    );
  }
}
