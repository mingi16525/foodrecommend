import 'package:go_router/go_router.dart';
import 'package:flutter/material.dart';
import '../screens/main_screen.dart';

class AppRoutes {
  static final router = GoRouter(
    initialLocation: '/',
    routes: [
      GoRoute(
        path: '/',
        builder: (context, state) => const MainScreen(),
      ),
      GoRoute(
        path: '/profile',
        builder: (context, state) => const PlaceholderScreen(title: 'Profile (Tab 5)'),
      ),
      // Add more routes for Feed, Group, Setup later
    ],
  );
}

class PlaceholderScreen extends StatelessWidget {
  final String title;
  const PlaceholderScreen({super.key, required this.title});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(title)),
      body: Center(child: Text('Placeholder for $title')),
    );
  }
}
