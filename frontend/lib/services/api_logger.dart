import 'package:flutter/foundation.dart';

class ApiLog {
  final DateTime timestamp;
  final String method;
  final String url;
  final int? statusCode;
  final String? requestBody;
  final String? responseBody;
  final String? error;

  ApiLog({
    required this.timestamp,
    required this.method,
    required this.url,
    this.statusCode,
    this.requestBody,
    this.responseBody,
    this.error,
  });
}

class ApiLogger extends ChangeNotifier {
  // Singleton pattern
  static final ApiLogger _instance = ApiLogger._internal();
  factory ApiLogger() => _instance;
  ApiLogger._internal();

  final List<ApiLog> _logs = [];
  List<ApiLog> get logs => List.unmodifiable(_logs);

  void addLog({
    required String method,
    required String url,
    int? statusCode,
    String? requestBody,
    String? responseBody,
    String? error,
  }) {
    _logs.insert(
      0,
      ApiLog(
        timestamp: DateTime.now(),
        method: method,
        url: url,
        statusCode: statusCode,
        requestBody: requestBody,
        responseBody: responseBody,
        error: error,
      ),
    );
    // Keep only last 100 logs to save memory
    if (_logs.length > 100) {
      _logs.removeLast();
    }
    notifyListeners();
  }

  void clearLogs() {
    _logs.clear();
    notifyListeners();
  }
}
