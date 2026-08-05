import 'package:flutter/material.dart';

class AppState extends ChangeNotifier {
  bool _isLoading = false;
  bool _isGuest = false;
  bool _isAuthenticated = false;

  bool get isLoading => _isLoading;
  bool get isGuest => _isGuest;
  bool get isAuthenticated => _isAuthenticated;

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

  void logout() {
    _isAuthenticated = false;
    _isGuest = false;
    notifyListeners();
  }
}
