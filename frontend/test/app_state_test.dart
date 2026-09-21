import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:food_recommend/config/api_config.dart';
import 'package:food_recommend/providers/app_state.dart';

void main() {
  setUp(() {
    SharedPreferences.setMockInitialValues({});
    ApiConfig.token = null;
  });

  test('restores an authenticated session from preferences', () async {
    SharedPreferences.setMockInitialValues({'auth_token': 'stored-token'});
    final state = AppState();

    await state.init();

    expect(state.isAuthenticated, isTrue);
    expect(state.isGuest, isFalse);
    expect(ApiConfig.token, 'stored-token');
  });

  test('logout clears the persisted token and auth state', () async {
    SharedPreferences.setMockInitialValues({'auth_token': 'stored-token'});
    final state = AppState();
    await state.init();

    await state.logout();

    expect(state.isAuthenticated, isFalse);
    expect(ApiConfig.token, isNull);
    expect((await SharedPreferences.getInstance()).getString('auth_token'), isNull);
  });

  test('guest mode is not authenticated', () {
    final state = AppState();

    state.loginAsGuest();

    expect(state.isGuest, isTrue);
    expect(state.isAuthenticated, isFalse);
  });
}
