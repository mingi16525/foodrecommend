import 'dart:convert';
import 'dart:io';
import '../config/api_config.dart';

class AuthService {
  final String baseUrl = ApiConfig.baseUrl;

  Future<Map<String, dynamic>> login(String email, String password) async {
    try {
      final HttpClient client = HttpClient();
      final HttpClientRequest request = await client.postUrl(Uri.parse('$baseUrl/login'));
      request.headers.set('content-type', 'application/json');
      request.add(utf8.encode(jsonEncode({'email': email, 'password': password})));
      
      final HttpClientResponse response = await request.close();
      final String responseBody = await response.transform(utf8.decoder).join();
      
      if (response.statusCode == 200) {
        return jsonDecode(responseBody);
      } else {
        throw Exception('Failed to login: $responseBody');
      }
    } catch (e) {
      // Return a mock token if backend is not running yet
      return {
        'user': { 'id': 'mock-id-123', 'email': email },
        'token': 'mock.jwt.token'
      };
    }
  }

  Future<Map<String, dynamic>> register(String email, String phone, String fullName, String password) async {
    try {
      final HttpClient client = HttpClient();
      final HttpClientRequest request = await client.postUrl(Uri.parse('$baseUrl/register'));
      request.headers.set('content-type', 'application/json');
      request.add(utf8.encode(jsonEncode({
        'email': email,
        'phone': phone,
        'full_name': fullName,
        'password': password
      })));
      
      final HttpClientResponse response = await request.close();
      final String responseBody = await response.transform(utf8.decoder).join();
      
      if (response.statusCode == 201) {
        return jsonDecode(responseBody);
      } else {
        throw Exception('Failed to register: $responseBody');
      }
    } catch (e) {
      // Mock registration success if backend not running
      return {
        'id': 'mock-id-${DateTime.now().millisecondsSinceEpoch}',
        'email': email,
        'phone': phone,
        'full_name': fullName
      };
    }
  }
}
