import 'package:flutter_test/flutter_test.dart';
import 'package:food_recommend/services/api_logger.dart';

void main() {
  final logger = ApiLogger();

  setUp(() => logger.clearLogs());

  test('stores newest API log first and caps history at 100 entries', () {
    for (var index = 0; index < 101; index++) {
      logger.addLog(method: 'GET', url: '/$index');
    }

    expect(logger.logs, hasLength(100));
    expect(logger.logs.first.url, '/100');
    expect(logger.logs.last.url, '/1');
  });
}
