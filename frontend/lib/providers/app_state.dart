import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../config/api_config.dart';

class AppState extends ChangeNotifier {
  bool _isLoading = false;
  bool _isGuest = false;
  bool _isAuthenticated = false;

  bool get isLoading => _isLoading;
  bool get isGuest => _isGuest;
  bool get isAuthenticated => _isAuthenticated;

  Future<void> init() async {
    final prefs = await SharedPreferences.getInstance();
    final savedToken = prefs.getString('auth_token');
    
    if (savedToken != null && savedToken.isNotEmpty) {
      ApiConfig.token = savedToken;
      _isAuthenticated = true;
      _isGuest = false;
    } else {
      _isAuthenticated = false;
    }
    notifyListeners();
  }

  void setLoading(bool value) {
    _isLoading = value;
    notifyListeners();
  }

  void loginAsGuest() {
    _isGuest = true;
    _isAuthenticated = false;
    notifyListeners();
  }

  void login() {
    _isAuthenticated = true;
    _isGuest = false;
    notifyListeners();
  }

  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('auth_token');
    ApiConfig.token = null;
    
    _isAuthenticated = false;
    _isGuest = false;
    notifyListeners();
  }
}
