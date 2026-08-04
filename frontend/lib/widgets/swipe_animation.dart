import 'package:flutter/material.dart';

class SwipeAnimation extends StatelessWidget {
  final Widget child;
  final bool isLiked;

  const SwipeAnimation({Key? key, required this.child, this.isLiked = false}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    // This is a placeholder for a rich Tinder-style swipe animation wrapper.
    // In a real application, you would use a package like `flutter_tindercard` 
    // or implement a custom GestureDetector with animated Matrix4 transformations.
    return AnimatedContainer(
      duration: Duration(milliseconds: 300),
      curve: Curves.easeInOut,
      decoration: BoxDecoration(
        boxShadow: [
          BoxShadow(
            color: isLiked ? Colors.green.withOpacity(0.3) : Colors.black12,
            blurRadius: 10,
            spreadRadius: 2,
          )
        ],
      ),
      child: child,
    );
  }
}
