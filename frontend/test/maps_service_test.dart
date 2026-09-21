import 'package:flutter_test/flutter_test.dart';
import 'package:food_recommend/services/maps_service.dart';

void main() {
  test('calculates zero distance for identical coordinates', () {
    expect(MapsService.calculateDistance(10, 106, 10, 106), closeTo(0, 0.0001));
  });

  test('calculates a real non-constant distance', () {
    final distance = MapsService.calculateDistance(0, 0, 0, 1);

    expect(distance, closeTo(111.19, 0.2));
  });
}
