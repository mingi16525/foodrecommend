import 'package:go_router/go_router.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../screens/main_screen.dart';
import '../screens/auth/login_screen.dart';
import '../providers/app_state.dart';

class AppRoutes {
  static final router = GoRouter(
    initialLocation: '/login',
    redirect: (context, state) {
      final appState = Provider.of<AppState>(context, listen: false);
      final isLoggingIn = state.matchedLocation == '/login';
      final isRegistering = state.matchedLocation == '/register';

      if (!appState.isAuthenticated && !appState.isGuest && !isLoggingIn && !isRegistering) {
        return '/login';
      }
      return null;
    },
    routes: [
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginScreen(),
      ),
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
